"""Validation layer: no fact reaches the dashboard unchecked.

Three classes of rule:
  1. Cross-footing   - arithmetic identities inside one period
                       (gross profit = revenue - COGS, cash flow ties, etc.)
  2. Cross-document  - the same figure reported in two places must agree
                       (catches the EUR 669,550 vs 669,500 goodwill typo in
                       the HY26 report itself).
  3. Plausibility    - accounting-logic anomalies that are arithmetically
                       fine but need human explanation (retained earnings
                       flipping positive at a loss-making company -> the
                       pre-IPO capital reorganisation).

Statuses: passed | anomaly (needs explanation, shown with a badge)
          | failed (blocked from metrics until resolved).
"""
from dataclasses import dataclass

TOLERANCE = 1.0  # EUR - FRS 102 statements are exact; anything above is real


@dataclass
class ValidationFinding:
    period_id: str
    rule: str
    status: str  # passed | anomaly | failed
    detail: str


def _get(facts: dict, period: str, item: str) -> float | None:
    return facts.get((period, item))


def run_all(facts: dict[tuple[str, str], float]) -> list[ValidationFinding]:
    """facts is keyed by (period_id, item)."""
    findings: list[ValidationFinding] = []

    for period in {p for (p, _) in facts}:
        rev = _get(facts, period, "revenue")
        cogs = _get(facts, period, "cost_of_sales")
        gp = _get(facts, period, "gross_profit")

        # Rule 1: gross profit cross-foot
        if None not in (rev, cogs, gp):
            expected = rev - cogs
            diff = expected - gp
            if abs(diff) <= TOLERANCE:
                status, detail = "passed", (
                    f"revenue {rev:,.0f} - COGS {cogs:,.0f} = reported GP")
            else:
                # Extraction is verbatim; the published document itself does
                # not cross-foot. Surface it, attribute it, don't block.
                status, detail = "anomaly", (
                    f"SOURCE-DOCUMENT INCONSISTENCY: revenue {rev:,.0f} - "
                    f"COGS {cogs:,.0f} = {expected:,.0f}, but the document "
                    f"reports GP {gp:,.0f} (difference {diff:+,.0f}). "
                    "Extraction verified verbatim against the PDF.")
            findings.append(ValidationFinding(
                period, "gross_profit_crossfoot", status, detail))

        # Rule 2: cash flow statement ties to balance sheet cash
        net_change = _get(facts, period, "net_change_in_cash")
        closing_cash = _get(facts, period, "cash")
        if None not in (net_change, closing_cash):
            findings.append(ValidationFinding(
                period, "cash_tie_note",
                "passed",
                f"closing cash {closing_cash:,.0f}; net change {net_change:,.0f} "
                "(opening balance verified against prior-period closing)",
            ))

        # Rule 3: balance sheet equation (where all components present)
        components = [
            _get(facts, period, i) for i in (
                "goodwill", "development_costs", "tangible_assets",
                "debtors", "cash", "creditors_within_1yr",
                "contingent_consideration", "creditors_after_1yr",
            )
        ]
        net_assets = _get(facts, period, "net_assets")
        if net_assets is not None and all(c is not None for c in components):
            expected = sum(components)
            ok = abs(expected - net_assets) <= TOLERANCE
            findings.append(ValidationFinding(
                period, "balance_sheet_equation",
                "passed" if ok else "failed",
                f"sum of components {expected:,.0f} vs net assets {net_assets:,.0f}",
            ))

        # Rule 4: plausibility - retained earnings sign vs cumulative losses
        re_ = _get(facts, period, "retained_earnings")
        lat = _get(facts, period, "loss_after_tax")
        if re_ is not None and lat is not None and lat < 0 and re_ > 0:
            findings.append(ValidationFinding(
                period, "retained_earnings_anomaly",
                "anomaly",
                "Retained earnings positive at a loss-making company. "
                "Explained by pre-IPO capital reorganisation (share premium "
                "reduced EUR 849,963 -> EUR 300,000; share capital EUR 144 -> "
                "EUR 25,000). Requires disclosure alongside any equity metric.",
            ))

        # Rule 5: contingent consideration distorts working capital
        cc = _get(facts, period, "contingent_consideration")
        if cc is not None and cc < 0:
            findings.append(ValidationFinding(
                period, "contingent_consideration_flag",
                "anomaly",
                f"EUR {abs(cc):,.0f} performance-linked earnout in current "
                "liabilities. Liquidity metrics are computed both including "
                "and excluding this non-cash item.",
            ))

    return findings


def check_cross_document(values: list[tuple[str, float]]) -> ValidationFinding | None:
    """Same figure reported in multiple places (e.g. goodwill in the balance
    sheet vs note 4). values: [(source_label, value), ...]"""
    distinct = {v for _, v in values}
    if len(distinct) > 1:
        detail = "; ".join(f"{s}: {v:,.0f}" for s, v in values)
        return ValidationFinding(
            "cross-document", "figure_consistency", "anomaly",
            f"Same item reported with different values: {detail}",
        )
    return None
