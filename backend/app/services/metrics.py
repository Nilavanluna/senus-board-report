"""Metrics engine - the 'model' that powers the Board Report.

Every metric is computed from validated FinancialFacts at request time and
returns: value, formula, inputs (with fact provenance), and caveats. The
caveat strings are first-class output - a board report that hides its
assumptions is worthless.

Assumptions documented here and in the README:
- EBITDA = operating result + depreciation (+ amortisation when disclosed).
  Senus does not disclose amortisation separately in the HY26 interims.
- No monthly data exists for Senus, so 'MoM' in the brief is delivered as
  half-year period analysis with seasonality adjustment.
- DSCR uses (interest paid + scheduled loan repayments) as debt service.
"""
from dataclasses import dataclass, field


@dataclass
class MetricResult:
    name: str
    period: str
    value: float | None
    unit: str
    formula: str
    inputs: dict = field(default_factory=dict)
    caveats: list[str] = field(default_factory=list)


class MetricsEngine:
    def __init__(self, facts: dict[tuple[str, str], float], kpis: dict):
        self.f = facts
        self.kpis = kpis

    def _g(self, period: str, item: str) -> float | None:
        return self.f.get((period, item))

    # ---------- Growth & Revenue ----------
    def revenue_growth(self, period: str, prior: str) -> MetricResult:
        cur, prev = self._g(period, "revenue"), self._g(prior, "revenue")
        val = (cur / prev - 1) * 100 if cur and prev else None
        return MetricResult(
            "revenue_growth", period, val, "%",
            f"({period} revenue / {prior} revenue) - 1",
            {"current": cur, "prior": prev},
            ["H1 vs H1 comparison controls for soil-sampling seasonality; "
             "H2 is structurally the larger half."],
        )

    def senus2030_gap(self) -> MetricResult:
        """The single most important board question: is FY26 on track for
        the >=50% CAGR commitment made at listing?"""
        fy25 = self._g("FY2025", "revenue")
        h1 = self._g("H1FY2026", "revenue")
        h1_prior = self._g("H1FY2025", "revenue")
        if not all((fy25, h1, h1_prior)):
            return MetricResult("senus2030_gap", "FY2026", None, "EUR", "n/a")
        target_fy26 = fy25 * (1 + self.kpis["revenue_cagr_target"])
        h2_required = target_fy26 - h1
        h2_prior = fy25 - h1_prior
        accel = (h2_required / h2_prior - 1) * 100
        return MetricResult(
            "senus2030_gap", "FY2026", h2_required, "EUR",
            "FY25 revenue x 1.5 - H1FY26 revenue = required H2FY26 revenue",
            {
                "fy26_target": round(target_fy26),
                "h1_delivered": h1,
                "h2_required": round(h2_required),
                "h2_prior_year": round(h2_prior),
                "required_h2_acceleration_pct": round(accel, 1),
            },
            [f"Hitting the Senus 2030 50% CAGR in FY26 requires H2 revenue of "
             f"EUR {h2_required:,.0f}, i.e. {accel:.1f}% growth vs H2 FY25. "
             "H1 grew 4.1%; management guided 'modest growth' and cites "
             "weather-delayed sampling. Directors' own language points to "
             "FY26 landing below the CAGR line unless pipeline converts."],
        )

    # ---------- Profitability ----------
    def margin(self, period: str, kind: str) -> MetricResult:
        rev = self._g(period, "revenue")
        num = {
            "gross": self._g(period, "gross_profit"),
            "operating": self._g(period, "operating_loss"),
            "ebitda": self.ebitda(period).value,
        }[kind]
        val = (num / rev) * 100 if rev and num is not None else None
        return MetricResult(
            f"{kind}_margin", period, val, "%",
            f"{kind} result / revenue",
            {"numerator": num, "revenue": rev},
        )

    def ebitda(self, period: str) -> MetricResult:
        op = self._g(period, "operating_loss")
        dep = self._g(period, "depreciation") or 0
        val = op + dep if op is not None else None
        return MetricResult(
            "ebitda", period, val, "EUR",
            "operating result + depreciation",
            {"operating_result": op, "depreciation": dep},
            ["Amortisation of goodwill/development costs not separately "
             "disclosed in HY26 interims; EBITDA may be understated. "
             "Senus 2030 targets EBITDA positive during FY2028."],
        )

    # ---------- Cash & Liquidity ----------
    def cash_runway(self, period: str) -> MetricResult:
        cash = self._g(period, "cash")
        ocf = self._g(period, "net_operating_cash_flow")
        months = None
        if cash and ocf and ocf < 0:
            months = cash / (abs(ocf) / 6)  # half-year period -> monthly burn
        return MetricResult(
            "cash_runway", period, round(months, 1) if months else None, "months",
            "closing cash / monthly operating cash burn",
            {"cash": cash, "half_year_operating_outflow": ocf},
            ["Burn rate from H1 FY26 actuals; excludes the EUR 850k Loamin "
             "earnout (performance-linked, non-cash on completion) and "
             "assumes no further raise. Post EUR 1.1m placement position."],
        )

    def ebitda_to_fcf_bridge(self, period: str) -> MetricResult:
        e = self.ebitda(period).value
        wc = self._g(period, "working_capital_movement") or 0
        interest = -(self._g(period, "interest_expense") or 0)
        capex = self._g(period, "capex") or 0
        fcf = (e or 0) + wc + interest + capex if e is not None else None
        return MetricResult(
            "fcf", period, fcf, "EUR",
            "EBITDA + working capital movement - interest - capex",
            {"ebitda": e, "working_capital": wc,
             "interest": interest, "capex": capex},
        )

    # ---------- Solvency & Leverage ----------
    def dscr(self, period: str) -> MetricResult:
        e = self.ebitda(period).value
        interest = self._g(period, "interest_expense") or 0
        principal = abs(self._g(period, "loan_repayment") or 0)
        service = interest + principal
        val = e / service if e is not None and service else None
        return MetricResult(
            "dscr", period, round(val, 2) if val is not None else None, "x",
            "EBITDA / (interest + scheduled principal repayments)",
            {"ebitda": e, "interest": interest, "principal_repaid": principal},
            ["Negative DSCR reflects pre-profitability stage: debt service "
             "is currently funded from equity raises, not operations. "
             "Bank debt is modest (EUR 76.5k, SBCI-backed)."],
        )

    # ---------- Returns ----------
    def roce(self, period: str) -> MetricResult:
        op = self._g(period, "operating_loss")
        net_assets = self._g(period, "net_assets")
        lt_debt = abs(self._g(period, "creditors_after_1yr") or 0)
        cap_employed = (net_assets or 0) + lt_debt
        val = (op / cap_employed) * 100 if op is not None and cap_employed else None
        return MetricResult(
            "roce", period, round(val, 1) if val is not None else None, "%",
            "operating result / (net assets + long-term debt)",
            {"operating_result": op, "capital_employed": cap_employed},
            ["Capital employed inflated by Loamin goodwill (EUR 669.6k) "
             "recognised in the period; equity base also reset by the "
             "pre-IPO capital reorganisation - trend, not level, is the "
             "meaningful signal here."],
        )
