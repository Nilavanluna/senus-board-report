import json
from datetime import date
import os
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from .models import Base, Document, FinancialFact, KpiSet, Period

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
        for f in data["facts"]:
            s.add(FinancialFact(
                period_id=f["period"], doc_id=f["doc"],
                statement=f["statement"], item=f["item"], value=f["value"],
                validation_status="unchecked",
                extra={"note": f.get("note")} if f.get("note") else None,
            ))
        s.add(KpiSet(name="senus_2030", data=data["kpis"]))
        s.add(KpiSet(name="corporate_events", data={"events": data.get("events", [])}))
        s.commit()


def facts_dict(s: Session) -> dict[tuple[str, str], float]:
    rows = s.execute(select(FinancialFact)).scalars().all()
    return {(r.period_id, r.item): r.value for r in rows}
