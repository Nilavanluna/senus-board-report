"""Database models.

Design principle: every number shown on the dashboard must be traceable to a
source document, and carry a validation status. FinancialFact is the atomic
unit; Metric values are always derived at request time (never stored) so the
metrics layer cannot drift from the underlying facts.
"""
from datetime import date, datetime

from sqlalchemy import (JSON, Boolean, Date, DateTime, Float, ForeignKey,
                        String, Text)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Document(Base):
    """A source document (Information Document, HY results, etc.)."""

    __tablename__ = "documents"

    doc_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(Text)
    published: Mapped[date] = mapped_column(Date)
    source_url: Mapped[str] = mapped_column(Text)
    audited: Mapped[bool] = mapped_column(Boolean, default=False)
    raw_text_path: Mapped[str | None] = mapped_column(Text, nullable=True)

    facts: Mapped[list["FinancialFact"]] = relationship(back_populates="document")


class Period(Base):
    """A reporting period (annual or half-year)."""

    __tablename__ = "periods"

    period_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    start: Mapped[date] = mapped_column(Date)
    end: Mapped[date] = mapped_column(Date)
    type: Mapped[str] = mapped_column(String(10))  # annual | half


class FinancialFact(Base):
    """One extracted financial line item, fully traceable."""

    __tablename__ = "financial_facts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    period_id: Mapped[str] = mapped_column(ForeignKey("periods.period_id"))
    doc_id: Mapped[str] = mapped_column(ForeignKey("documents.doc_id"))
    statement: Mapped[str] = mapped_column(String(20))  # pnl | balance | cashflow | kpi
    item: Mapped[str] = mapped_column(String(60), index=True)
    value: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="EUR")
    source_page: Mapped[int | None] = mapped_column(nullable=True)
    source_excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    extraction_confidence: Mapped[float] = mapped_column(Float, default=1.0)
    validation_status: Mapped[str] = mapped_column(
        String(20), default="unchecked"
    )  # unchecked | passed | anomaly | failed
    validation_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    extra: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    document: Mapped["Document"] = relationship(back_populates="facts")


class KpiSet(Base):
    """Strategy KPIs and operational metrics (Senus 2030 targets etc.)."""

    __tablename__ = "kpi_sets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    data: Mapped[dict] = mapped_column(JSON)
