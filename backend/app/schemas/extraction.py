"""Pydantic schemas used as the LLM structured-output contract.

The extractor asks the model to return exactly this shape. Anything that
doesn't parse is rejected and retried; the model is never allowed to invent
line items outside the enum below. Each value must be accompanied by the
verbatim source excerpt and page number, which is what makes every dashboard
figure click-through-auditable.
"""
from enum import Enum

from pydantic import BaseModel, Field


class StatementType(str, Enum):
    pnl = "pnl"
    balance = "balance"
    cashflow = "cashflow"
    kpi = "kpi"


class LineItem(str, Enum):
    # P&L
    revenue = "revenue"
    cost_of_sales = "cost_of_sales"
    gross_profit = "gross_profit"
    admin_expenses = "admin_expenses"
    other_operating_income = "other_operating_income"
    operating_loss = "operating_loss"
    interest_expense = "interest_expense"
    loss_after_tax = "loss_after_tax"
    # Balance sheet
    goodwill = "goodwill"
    development_costs = "development_costs"
    tangible_assets = "tangible_assets"
    debtors = "debtors"
    cash = "cash"
    creditors_within_1yr = "creditors_within_1yr"
    contingent_consideration = "contingent_consideration"
    creditors_after_1yr = "creditors_after_1yr"
    net_assets = "net_assets"
    share_capital = "share_capital"
    share_premium = "share_premium"
    retained_earnings = "retained_earnings"
    bank_debt = "bank_debt"
    # Cash flow
    depreciation = "depreciation"
    working_capital_movement = "working_capital_movement"
    net_operating_cash_flow = "net_operating_cash_flow"
    capex = "capex"
    loan_repayment = "loan_repayment"
    share_issue_proceeds = "share_issue_proceeds"
    net_change_in_cash = "net_change_in_cash"


class ExtractedFact(BaseModel):
    """One line item extracted from a source document."""

    period_id: str = Field(description="e.g. FY2025, H1FY2026")
    statement: StatementType
    item: LineItem
    value: float = Field(description="EUR. Negative for losses/outflows/liabilities.")
    source_page: int | None = Field(
        default=None, description="Page in the source PDF where the figure appears"
    )
    source_excerpt: str = Field(
        description="Verbatim text surrounding the figure, max 200 chars"
    )
    confidence: float = Field(
        ge=0.0, le=1.0,
        description="Extractor confidence. <0.9 flags the figure for human review.",
    )


class ExtractionResult(BaseModel):
    """Full structured output for one document pass."""

    doc_id: str
    facts: list[ExtractedFact]
    warnings: list[str] = Field(
        default_factory=list,
        description="Anything ambiguous the model noticed (restatements, "
        "inconsistencies between narrative and tables, unusual signs).",
    )
