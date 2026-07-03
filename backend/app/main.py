"""Senus Board Report API."""
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import facts_dict, get_session, init_db_and_seed
from .models import Document, FinancialFact, KpiSet
from .services.metrics import MetricsEngine
from .services.validator import check_cross_document, run_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db_and_seed()
    yield


app = FastAPI(title="Senus PLC Board Report API", version="0.1.0",
              lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"], allow_headers=["*"],
)


def engine_for(s: Session) -> MetricsEngine:
    kpis = s.execute(select(KpiSet).where(KpiSet.name == "senus_2030")) \
            .scalar_one().data
    return MetricsEngine(facts_dict(s), kpis)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/facts")
def list_facts(s: Session = Depends(get_session)):
    rows = s.execute(select(FinancialFact)).scalars().all()
    return [{
        "id": r.id, "period": r.period_id, "statement": r.statement,
        "item": r.item, "value": r.value, "doc": r.doc_id,
        "validation_status": r.validation_status,
        "note": (r.extra or {}).get("note"),
    } for r in rows]


@app.get("/api/facts/{fact_id}/provenance")
def fact_provenance(fact_id: int, s: Session = Depends(get_session)):
    """Click-through audit trail for any number on the dashboard."""
    r = s.get(FinancialFact, fact_id)
    if not r:
        raise HTTPException(404)
    doc = s.get(Document, r.doc_id)
    return {
        "item": r.item, "period": r.period_id, "value": r.value,
        "document": doc.title, "published": str(doc.published),
        "audited": doc.audited, "source_url": doc.source_url,
        "source_page": r.source_page, "source_excerpt": r.source_excerpt,
        "extraction_confidence": r.extraction_confidence,
        "validation_status": r.validation_status,
        "validation_note": r.validation_note,
    }


@app.get("/api/validation")
def validation_report(s: Session = Depends(get_session)):
    findings = [f.__dict__ for f in run_all(facts_dict(s))]
    goodwill = check_cross_document([
        ("HY26 balance sheet", 669550), ("HY26 note 4", 669500),
    ])
    if goodwill:
        findings.append(goodwill.__dict__)
    return {"findings": findings,
            "summary": {
                "passed": sum(1 for f in findings if f["status"] == "passed"),
                "anomalies": sum(1 for f in findings if f["status"] == "anomaly"),
                "failed": sum(1 for f in findings if f["status"] == "failed"),
            }}


@app.get("/api/metrics")
def metrics(s: Session = Depends(get_session)):
    m = engine_for(s)
    results = [
        m.revenue_growth("FY2025", "FY2024"),
        m.revenue_growth("H1FY2026", "H1FY2025"),
        m.senus2030_gap(),
        m.margin("FY2025", "gross"), m.margin("H1FY2026", "gross"),
        m.margin("H1FY2026", "operating"),
        m.ebitda("H1FY2026"),
        m.cash_runway("H1FY2026"),
        m.ebitda_to_fcf_bridge("H1FY2026"),
        m.dscr("H1FY2026"),
        m.roce("H1FY2026"),
    ]
    return {"metrics": [r.__dict__ for r in results]}


@app.get("/api/events")
def corporate_events(s: Session = Depends(get_session)):
    """Corporate events timeline (M&A, listings, governance changes)."""
    row = s.execute(select(KpiSet).where(KpiSet.name == "corporate_events")) \
           .scalar_one_or_none()
    return row.data if row else {"events": []}


@app.get("/api/insights/{audience}")
def insights(audience: str, s: Session = Depends(get_session)):
    from .services.insights import AUDIENCE_LENSES, generate_commentary
    if audience not in AUDIENCE_LENSES:
        raise HTTPException(400, f"audience must be one of {list(AUDIENCE_LENSES)}")
    payload = metrics(s)
    payload["corporate_events"] = corporate_events(s)["events"]
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return {"audience": audience, "commentary": None,
                "note": "Set ANTHROPIC_API_KEY to enable AI commentary."}
    return {"audience": audience,
            "commentary": generate_commentary(payload, audience)}
