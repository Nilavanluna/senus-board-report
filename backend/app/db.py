import json
from datetime import date
import os
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from .models import Base, Document, FinancialFact, KpiSet, Period
from .services.validator import check_cross_document, run_all

# Maps a validator rule to the fact item(s) it makes a pass/anomaly/fail
# judgement about, so a finding can be written back onto the specific
# FinancialFact row(s) it concerns rather than left floating in the
# /api/validation response only.
RULE_ITEMS = {
    "gross_profit_crossfoot": ["gross_profit"],
    "cash_tie_note": ["cash", "net_change_in_cash"],
    "balance_sheet_equation": ["net_assets"],
    "retained_earnings_anomaly": ["retained_earnings"],
    "contingent_consideration_flag": ["contingent_consideration"],
}

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql+psycopg://senus:senus@localhost:5432/senus"
)
# SQLite fallback so the repo runs with zero setup (demo mode)
if os.environ.get("DEMO_MODE") == "1":
    DATABASE_URL = "sqlite:///./senus_demo.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

SEED_PATH = Path(__file__).parent.parent / "seed" / "senus_facts.json"


def get_session():
    with SessionLocal() as session:
        yield session


def init_db_and_seed() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as s:
        if s.execute(select(FinancialFact).limit(1)).first():
            return  # already seeded
        data = json.loads(SEED_PATH.read_text())
        for d in data["documents"]:
            d["published"] = date.fromisoformat(d["published"])
            s.add(Document(**d))
        for p in data["periods"]:
            p["start"] = date.fromisoformat(p["start"])
            p["end"] = date.fromisoformat(p["end"])
            s.add(Period(**p))
        fact_rows: dict[tuple[str, str], FinancialFact] = {}
        facts_values: dict[tuple[str, str], float] = {}
        for f in data["facts"]:
            row = FinancialFact(
                period_id=f["period"], doc_id=f["doc"],
                statement=f["statement"], item=f["item"], value=f["value"],
                validation_status="unchecked",
                source_page=f.get("source_page"),
                source_excerpt=f.get("source_excerpt"),
                extra={"note": f.get("note")} if f.get("note") else None,
            )
            s.add(row)
            fact_rows[(f["period"], f["item"])] = row
            facts_values[(f["period"], f["item"])] = f["value"]
        s.add(KpiSet(name="senus_2030", data=data["kpis"]))
        s.add(KpiSet(name="corporate_events", data={"events": data.get("events", [])}))
        _apply_validation_writeback(fact_rows, facts_values)
        s.commit()


def _apply_validation_writeback(
    fact_rows: dict[tuple[str, str], FinancialFact],
    facts_values: dict[tuple[str, str], float],
) -> None:
    """Persist the validator's judgement onto the FinancialFact rows it
    concerns, so validation_status isn't stuck at 'unchecked' forever and
    the dashboard can flag anomalies without recomputing validation on every
    fact render. Facts no rule touches are left 'unchecked' by design."""
    for finding in run_all(facts_values):
        for item in RULE_ITEMS.get(finding.rule, []):
            row = fact_rows.get((finding.period_id, item))
            if row:
                row.validation_status = finding.status
                row.validation_note = finding.detail

    # Cross-document goodwill check (main.py's /api/validation hardcodes the
    # same two figures) - the mismatch lives on the H1FY2026 goodwill fact.
    goodwill = check_cross_document([
        ("HY26 balance sheet", 669550), ("HY26 note 4", 669500),
    ])
    if goodwill:
        row = fact_rows.get(("H1FY2026", "goodwill"))
        if row:
            row.validation_status = goodwill.status
            row.validation_note = goodwill.detail


def facts_dict(s: Session) -> dict[tuple[str, str], float]:
    rows = s.execute(select(FinancialFact)).scalars().all()
    return {(r.period_id, r.item): r.value for r in rows}
