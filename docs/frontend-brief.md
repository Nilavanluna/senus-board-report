# Frontend Brief — Senus PLC Board Report Dashboard

## Goal
A polished dashboard a CEO would log in to. React + Vite + Tailwind + Recharts.
Dark, financial-terminal aesthetic (think Stripe dashboard, not Bootstrap admin).
Data comes exclusively from the backend API — no numbers hardcoded in components.

## API (already live on :8000)
- GET /api/metrics — list of metrics: {name, period, value, unit, formula, inputs, caveats[]}
- GET /api/facts — every extracted line item with validation_status
- GET /api/facts/{id}/provenance — document, page, excerpt, confidence
- GET /api/validation — findings {period_id, rule, status, detail}; statuses: passed|anomaly|failed
- GET /api/events — corporate events timeline
- GET /api/insights/{audience} — AI commentary; audiences: board, management, equity_investor, credit_provider, governance

## Layout
Single-page app, left sidebar nav, four sections:

### 1. Overview (default)
- KPI cards: H1 FY26 revenue (+4.1% YoY), gross margin 81.7%, cash EUR 735.2k, runway ~10.7 months, EBITDA -473.7k — ALL from /api/metrics, not hardcoded
- Hero chart: revenue by period (FY24, FY25 bars; H1 FY25 vs H1 FY26 grouped), annotate seasonality (H2 structurally larger: soil sampling)
- SENUS 2030 TRACKER (the centrepiece, visually dominant, full width): FY26 target EUR 1.255M vs H1 delivered EUR 354.8k; callout "H2 requires EUR 900.7k = +81% vs H2 FY25"
- Margin trend line: 62.8% -> 77.5% -> 81.7%
- Validation summary banner ("X checks: Y passed, Z anomalies — click to review")

### 2. Financial detail
- Tabs: P&L / Balance Sheet / Cash Flow, tables per period from /api/facts
- EVERY figure clickable -> right-side drawer with provenance from /api/facts/{id}/provenance: source doc, published date, audited/unaudited badge, page, verbatim excerpt, confidence, validation status. This drawer is the product's identity.
- Anomaly badges (amber dot) on figures with validation_status=anomaly; tooltip shows the finding detail
- EBITDA->FCF bridge waterfall chart (Recharts)
- Unaudited figures get a subtle "unaudited" chip

### 3. Audience views (persona toggle)
Toggle: Board | Management | Equity Investor | Credit Provider
- Credit Provider: runway, DSCR, bank debt, working capital, contingent consideration incl/excl toggle
- Equity Investor: growth vs 50% CAGR commitment, path to EBITDA+ FY2028, dilution context (EUR 1.1M raise, 2,561,332 shares @ 5.126)
- Management: cost base, channel mix (Enterprise 69%/R&D 27%/Indep 4%), ACV by product (SOIL 12.3k/TERRAIN 21.5k/ERA 58.9k), pipeline
- Board: Senus 2030 tracker, events, risk summary
- AI commentary panel per persona from /api/insights/{audience}, regenerate button, loading skeleton; handle commentary:null gracefully (no API key note)
- Numbers in AI commentary matching the metrics payload get a subtle underline (verified)

### 4. Events & governance
- Vertical timeline from /api/events: Loamin acquisition, listing, AGM 8 Jul 2026, leadership transition (MD -> Vice Chairman by Oct 2026, MAR inside info), FY26 results due 11 Sep 2026
- Key-person risk callout linking the transition to the ERA vertical (highest ACV, financial-institutions growth engine)

## Non-negotiables
- No hardcoded financial numbers in JSX — everything from the API
- Loading and error states for every fetch
- Clean at 1080p for demo video
- Vite proxy /api -> http://localhost:8000
- Small components, one folder per section

## Nice-to-haves (only if time permits)
- Print-to-PDF stylesheet ("board pack" export)
- Fake login screen for the CEO-logs-in demo shot
