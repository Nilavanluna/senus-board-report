"""AI extraction pipeline: PDF -> structured facts.

Flow:
  1. PDF text is extracted per page (pypdf) so page numbers survive.
  2. Claude is called with a tool schema generated from ExtractionResult;
     tool-use forces valid JSON, so a malformed response cannot enter the DB.
  3. Every fact lands as validation_status='unchecked'; the validator
     (services/validator.py) then runs cross-footing rules before anything
     is trusted by the metrics layer.

Design decision (documented for README): we use one extraction pass per
statement type rather than one giant pass. Smaller prompts, higher accuracy,
and a failed P&L pass doesn't invalidate a good balance-sheet pass.
"""
import json
import os

import anthropic
from pypdf import PdfReader

from ..schemas.extraction import ExtractionResult

MODEL = os.environ.get("EXTRACTION_MODEL", "claude-sonnet-4-6")

SYSTEM = """You are a financial data extraction engine for Irish FRS 102 accounts.
Extract line items EXACTLY as reported. Rules:
- Never compute or infer a number that is not printed in the document.
- Losses, outflows and liabilities are NEGATIVE values.
- Include the verbatim excerpt and page number for every figure.
- If the same figure appears twice with different values, extract BOTH and
  add a warning describing the inconsistency.
- If narrative text and a statement table disagree, the table wins, but
  record the disagreement as a warning.
- Confidence below 0.9 for anything ambiguous (OCR noise, unlabelled columns,
  comparative-period confusion)."""


def pdf_to_pages(path: str) -> list[tuple[int, str]]:
    reader = PdfReader(path)
    return [(i + 1, page.extract_text() or "") for i, page in enumerate(reader.pages)]


def extraction_tool_schema() -> dict:
    return {
        "name": "record_extraction",
        "description": "Record extracted financial facts from the document.",
        "input_schema": ExtractionResult.model_json_schema(),
    }


def extract_document(path: str, doc_id: str, statement_hint: str) -> ExtractionResult:
    """Run one extraction pass over a document for one statement type."""
    client = anthropic.Anthropic()  # ANTHROPIC_API_KEY from env
    pages = pdf_to_pages(path)
    doc_text = "\n\n".join(f"[PAGE {n}]\n{t}" for n, t in pages)

    response = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        system=SYSTEM,
        tools=[extraction_tool_schema()],
        tool_choice={"type": "tool", "name": "record_extraction"},
        messages=[
            {
                "role": "user",
                "content": (
                    f"Document ID: {doc_id}\n"
                    f"Extract all '{statement_hint}' line items for every "
                    f"reporting period shown (including comparatives).\n\n{doc_text}"
                ),
            }
        ],
    )

    for block in response.content:
        if block.type == "tool_use" and block.name == "record_extraction":
            return ExtractionResult.model_validate(block.input)
    raise RuntimeError(f"No structured extraction returned for {doc_id}")


if __name__ == "__main__":
    import sys

    result = extract_document(sys.argv[1], sys.argv[2], sys.argv[3])
    print(json.dumps(result.model_dump(), indent=2, default=str))
