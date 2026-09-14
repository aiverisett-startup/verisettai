"""
SQLAlchemy 2.0 LedgerEntry model for double-entry bookkeeping.
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String,
    BigInteger,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from verisett.core.database import Base
from verisett.core.constants import EntryType
from verisett.models.base import utc_now


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    __table_args__ = (
        CheckConstraint("amount_cents > 0", name="chk_ledger_amount_positive"),
        Index("ix_ledger_from_account", "from_account"),
        Index("ix_ledger_to_account", "to_account"),
        Index("ix_ledger_contract_id", "contract_id"),
        Index("ix_ledger_entry_type", "entry_type"),
    )

    entry_id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    contract_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("contracts.id", ondelete="SET NULL"),
        nullable=True
    )
    from_account: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("accounts.id", ondelete="RESTRICT"),
        nullable=False
    )
    to_account: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("accounts.id", ondelete="RESTRICT"),
        nullable=False
    )
    amount_cents: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )
    entry_type: Mapped[EntryType] = mapped_column(
        SAEnum(EntryType, name="entry_type_enum", native_enum=False),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False
    )

    # Relationships
    contract = relationship("Contract", back_populates="ledger_entries")
