import type { Statement } from '../api/types'

// Display order for each statement's line items - not derivable from the API
// (facts come back in DB insertion order), so it's fixed here in one place.
// Anything not listed falls back to the end, in first-seen order, so a new
// extracted item doesn't disappear from the table.
export const STATEMENT_ITEM_ORDER: Record<Statement, string[]> = {
  pnl: [
    'revenue',
    'cost_of_sales',
    'gross_profit',
    'admin_expenses',
    'other_operating_income',
    'operating_loss',
    'interest_expense',
    'loss_after_tax',
  ],
  balance: [
    'goodwill',
    'development_costs',
    'tangible_assets',
    'debtors',
    'cash',
    'creditors_within_1yr',
    'contingent_consideration',
    'creditors_after_1yr',
    'net_assets',
    'share_capital',
    'share_premium',
    'retained_earnings',
  ],
  cashflow: [
    'depreciation',
    'working_capital_movement',
    'net_operating_cash_flow',
    'capex',
    'loan_repayment',
    'share_issue_proceeds',
    'net_change_in_cash',
  ],
  kpi: [],
}

export function sortItemsByStatement(items: string[], statement: Statement): string[] {
  const order = STATEMENT_ITEM_ORDER[statement]
  return [...items].sort((a, b) => {
    const ai = order.indexOf(a)
    const bi = order.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return 0 // preserve first-seen relative order for anything unlisted
  })
}
