"""Smoke tests: seed loads, validators catch the known anomalies,
metrics compute the numbers we hand-verified against the source PDFs."""
import os
os.environ["DEMO_MODE"] = "1"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    with client:
        assert client.get("/api/health").json()["status"] == "ok"


def test_facts_seeded():
    with client:
        facts = client.get("/api/facts").json()
        assert len(facts) > 40


def test_validation_catches_known_anomalies():
    with client:
        report = client.get("/api/validation").json()
        rules = {f["rule"] for f in report["findings"]}
        assert "retained_earnings_anomaly" in rules
        assert "figure_consistency" in rules  # the EUR50 goodwill typo
        # Validator caught a real EUR1,000 cross-foot break in Senus's
        # published H1FY25 comparatives (340,931 - 69,600 != 272,331):
        gp = [f for f in report["findings"]
              if f["rule"] == "gross_profit_crossfoot"
              and f["period_id"] == "H1FY2025"][0]
        assert gp["status"] == "anomaly"
        assert report["summary"]["failed"] == 0


def test_metrics_hand_verified():
    with client:
        m = {r["name"] + ":" + r["period"]: r
             for r in client.get("/api/metrics").json()["metrics"]}
        # Hand-verified against source PDFs:
        assert abs(m["revenue_growth:FY2025"]["value"] - 21.6) < 0.1
        assert abs(m["revenue_growth:H1FY2026"]["value"] - 4.1) < 0.1
        assert abs(m["gross_margin:H1FY2026"]["value"] - 81.7) < 0.1
        assert abs(m["ebitda:H1FY2026"]["value"] - (-473739)) < 1
        runway = m["cash_runway:H1FY2026"]["value"]
        assert 10 < runway < 11.5  # ~10.7 months
        gap = m["senus2030_gap:FY2026"]
        assert abs(gap["inputs"]["h2_required"] - 900674) < 5


def test_events_include_leadership_transition():
    with client:
        events = client.get("/api/events").json()["events"]
        assert any(e["type"] == "governance_risk" for e in events)


def test_kpis_expose_strategy_data():
    with client:
        kpis = client.get("/api/kpis").json()
        assert kpis["revenue_cagr_target"] == 0.5
        assert kpis["acv_by_product"]["ERA"] == 58900
        assert kpis["shares_in_issue"] == 2561332


def test_validation_writeback_applied():
    """The validator's findings must be persisted onto FinancialFact rows at
    seed time, not just returned live from /api/validation."""
    with client:
        facts = client.get("/api/facts").json()
        by_key = {(f["period"], f["item"]): f for f in facts}

        gp = by_key[("H1FY2025", "gross_profit")]
        assert gp["validation_status"] == "anomaly"
        assert "SOURCE-DOCUMENT INCONSISTENCY" in gp["validation_note"]

        re_ = by_key[("H1FY2026", "retained_earnings")]
        assert re_["validation_status"] == "anomaly"
        assert "capital reorganisation" in re_["validation_note"]

        cc = by_key[("H1FY2026", "contingent_consideration")]
        assert cc["validation_status"] == "anomaly"
        assert "earnout" in cc["validation_note"]

        gw = by_key[("H1FY2026", "goodwill")]
        assert gw["validation_status"] == "anomaly"
        assert "669,550" in gw["validation_note"] and "669,500" in gw["validation_note"]

        # A fact covered by a passing rule is marked passed, not unchecked.
        assert by_key[("H1FY2026", "gross_profit")]["validation_status"] == "passed"

        # A fact no rule touches stays unchecked.
        assert by_key[("FY2024", "revenue")]["validation_status"] == "unchecked"
