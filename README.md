# Senus PLC Board Report — AI-Native Financial Analysis Platform

An AI-native platform that extracts Senus PLC's published financials into a
traceable database, computes board-report metrics, and generates
audience-specific AI commentary — built for the Assiduous Technology Graduate
Assessment.

**Core design principle: a board cannot act on numbers it cannot audit.**
Every figure on the dashboard is click-through traceable to its source
document, page, and verbatim excerpt, and carries a validation status. The
AI commentary layer is structurally prevented from inventing numbers.

## What the validation layer found in the real documents

Running the pipeline against Senus's actual published documents surfaced
three genuine issues — evidence the system works, not toy checks:

1. **€1,000 cross-foot break in published accounts.** In the H1 FY2026
   report, the H1 FY2025 comparatives show revenue €340,931 − COGS €69,600
   = €271,331, but reported gross profit is €272,331. The document itself
   is internally inconsistent by exactly €1,000.
2. **€50 goodwill inconsistency.** Goodwill is €669,550 in the consolidated
   balance sheet but €669,500 in note 4 of the same document.
3. **Retained earnings anomaly.** Retained earnings flipped from −€676,790
   to +€236,081 at a loss-making company — impossible from trading;
   explained by the pre-IPO capital reorganisation (share premium
   €849,963 → €300,000). Flagged so equity metrics carry the caveat.

## Architecture

```
Source PDFs (Euronext / Assiduous IR)
      │  pypdf page-aware text extraction
      ▼
Claude structured-output extraction (tool-use, Pydantic contract)
      │  per-statement passes; malformed output cannot enter the DB
      ▼
Postgres: FinancialFact (value + doc + page + excerpt + confidence)
      │
      ├─► Validation layer: cross-footing, cross-document consistency,
      │   accounting-logic plausibility  →  passed / anomaly / failed
      │
      ├─► Metrics engine: growth, margins, EBITDA, FCF bridge, cash
      │   runway, DSCR, ROCE, Senus-2030 gap — computed at request time,
      │   each with formula, inputs, and caveats
      │
      └─► AI insights: Claude receives ONLY validated metrics JSON
          (never raw documents) → audience-specific commentary for
          Board / Management / Equity Investors / Credit Providers
      ▼
React dashboard (persona views, provenance click-through, anomaly badges)
```

## Key technical decisions

| Decision | Rationale |
|---|---|
| Tool-use structured outputs for extraction | Forces schema-valid JSON; the model cannot free-associate line items. Enum-constrained `LineItem` means unknown items are rejected, not invented. |
| Per-statement extraction passes | Smaller context, higher accuracy; one failed pass doesn't poison the rest. |
| Metrics computed at request time, never stored | The metrics layer cannot drift from the underlying facts. |
| Commentary LLM sees metrics JSON only | Hallucinated figures are structurally impossible — every number in the narrative must exist in the validated payload. |
| Anomaly ≠ failure | Real published accounts contain inconsistencies (see above). The system attributes them to the source and surfaces them rather than silently "fixing" or blocking. |
| SQLite `DEMO_MODE` | Zero-setup review: `DEMO_MODE=1 uvicorn app.main:app` runs with seeded, hand-verified data. Postgres via docker-compose for the deployed app. |

## Assumptions (documented, not hidden)

- **No monthly data exists** for Senus (annual + half-year reporting only),
  so "MoM" from the brief is delivered as half-period analysis with explicit
  seasonality handling — soil sampling makes H2 structurally the larger half
  (H2 FY25 ≈ €496k vs H1 FY25 €341k). Annualising H1×2 would be wrong.
- EBITDA = operating result + depreciation; amortisation is not separately
  disclosed in the HY26 interims, so EBITDA may be understated (noted in
  metric caveats).
- The €850k Loamin contingent consideration is performance-linked and
  non-cash on completion; liquidity metrics are computed both including and
  excluding it.
- H1 FY2026 figures are unaudited; every metric derived from them carries
  that flag via document-level `audited=false`.

## Headline findings the platform computes

- **Senus 2030 gap:** the ≥50% CAGR commitment implies FY26 revenue of
  ~€1.26M. H1 delivered €354.8k (+4.1%), so H2 must deliver ~€900.7k —
  **+81% vs H2 FY25**. The dashboard shows this as the board's #1 question.
- **Cash runway ~10.7 months** (€735.2k cash ÷ H1 operating burn of
  €410.3k/6), post the €1.1M placement, before any further raise.
- Gross margin expanding: 62.8% (FY24) → 77.5% (FY25) → 81.7% (H1 FY26).

## AI-assisted development workflow

Built with Claude (research, scoping, extraction-schema design, code
generation) with every generated component reviewed and hand-verified:
all metric outputs in `tests/test_api.py` were manually recomputed from the
source PDFs before being encoded as assertions. The validation findings
above were confirmed by hand against the published documents. I stand over
every number this system produces — and the system is designed so that
anyone else can too, one click deep.

## Run it

```bash
# zero-setup demo
cd backend && pip install -r requirements.txt
DEMO_MODE=1 uvicorn app.main:app --reload   # http://localhost:8000/docs

# full stack
export ANTHROPIC_API_KEY=sk-ant-...          # enables /api/insights
docker compose up
```

Frontend: `cd frontend && npm install && npm run dev` — the Vite dev server
proxies `/api/*` to `http://localhost:8000` (see `vite.config.ts`), so no
env var is needed locally.

Tests: `cd backend && DEMO_MODE=1 pytest`

> **Stale `senus_demo.db`:** `DEMO_MODE=1` seeds a local SQLite file
> (`backend/senus_demo.db`) once, on first run, and reuses it on every run
> after that — `init_db_and_seed` skips seeding if any `FinancialFact` row
> already exists. If you change `backend/seed/senus_facts.json`, the
> validation rules, or the models, delete that file
> (`rm backend/senus_demo.db`) before restarting/testing so the seed reruns
> against the new data. It's gitignored (`*.db`), so this is safe.

## Deploy (Render, split frontend/backend)

Frontend (static site) and backend (web service) deploy as separate Render
services on separate origins, so two things must line up:

1. **Backend `CORS_ORIGINS`** — set this env var on the backend service to
   the frontend's deployed URL (comma-separate multiple origins, e.g. a
   preview URL plus the production one):
   ```
   CORS_ORIGINS=https://senus-board-report.onrender.com
   ```
   `backend/app/main.py` reads it and falls back to
   `http://localhost:5173` if unset, so local dev is unaffected.

2. **Frontend `VITE_API_URL`** — set this build-time env var on the
   frontend static site to the backend service's URL (no trailing slash):
   ```
   VITE_API_URL=https://senus-board-report-api.onrender.com
   ```
   `frontend/src/api/client.ts` reads it once and prefixes every API
   request with it. Leave it unset locally (defaults to `''`) so requests
   stay relative and the Vite dev proxy above continues to work.

## API surface

- `GET /api/metrics` — all board metrics with formulas, inputs, caveats
- `GET /api/validation` — validation findings incl. source-document anomalies
- `GET /api/facts` / `GET /api/facts/{id}/provenance` — audit trail per figure
- `GET /api/insights/{board|management|equity_investor|credit_provider}`
