"""AI commentary layer.

Key design decision: the LLM never sees raw documents at commentary time and
is never allowed to introduce numbers. It receives ONLY the computed,
validated metrics (with caveats) and writes narrative around them per
audience. This makes hallucinated figures structurally impossible - any
number in the commentary must exist in the metrics payload, which the
frontend verifies by regex before rendering (numbers not present in the
payload are highlighted as unverified).
"""
import json
import os

import anthropic

MODEL = os.environ.get("INSIGHTS_MODEL", "claude-sonnet-4-6")

AUDIENCE_LENSES = {
    "board": "strategic progress vs Senus 2030, risk, runway, seasonality",
    "management": "operational levers: pipeline conversion, cost base, "
                  "channel mix, Loamin integration synergies",
    "equity_investor": "growth trajectory vs the 50% CAGR listing commitment, "
                       "path to EBITDA positive in FY2028, dilution risk",
    "credit_provider": "liquidity, runway, DSCR, working capital quality, "
                       "the EUR 850k contingent consideration treatment",
    "governance": "board changes, key-person risk, succession",
}

SYSTEM = """You write concise board-report commentary for Senus PLC.
Hard rules:
- Use ONLY numbers present in the metrics JSON provided. Never compute new ones.
- Every claim must trace to a metric or its caveats.
- State caveats plainly (unaudited interims, seasonality, capital reorg).
- Neutral, precise, no hype. 150-220 words per section."""


def generate_commentary(metrics_payload: dict, audience: str) -> str:
    client = anthropic.Anthropic()
    lens = AUDIENCE_LENSES.get(audience, AUDIENCE_LENSES["board"])
    response = client.messages.create(
        model=MODEL,
        max_tokens=1200,
        system=SYSTEM,
        messages=[{
            "role": "user",
            "content": (
                f"Audience: {audience}. Focus: {lens}.\n\n"
                f"Validated metrics:\n{json.dumps(metrics_payload, indent=2)}"
            ),
        }],
    )
    return "".join(b.text for b in response.content if b.type == "text")
