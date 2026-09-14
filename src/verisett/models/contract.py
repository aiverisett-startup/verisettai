"""
SQLAlchemy 2.0 Contract model for programmatic escrow contracts.
"""

import uuid
from datetime import datetime
from typing import Optional, Any
from sqlalchemy import (
    String,
    BigInteger,
    Integer,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    CheckConstraint,
    JSON,
    Index,
)
from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from verisett.core.database import Base
from verisett.core.constants import ContractStatus, AssertionType
from verisett.models.base import utc_now

JSONBType = JSON().with_variant(PG_JSONB(), "postgresql")



class Contract(Base):
    __tablename__ = "contracts"
    __table_args__ = (
        CheckConstraint("amount_cents > 0", name="chk_contract_amount_positive"),
        CheckConstraint("fee_cents >= 0", name="chk_contract_fee_non_negative"),
        Index("ix_contracts_status", "status"),
        Index("ix_contracts_payer_id", "payer_id"),
        Index("ix_contracts_worker_id", "worker_id"),
        Index("ix_contracts_expires_at", "expires_at"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    payer_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("accounts.id", ondelete="RESTRICT"),
        nullable=False
    )
    worker_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("accounts.id", ondelete="RESTRICT"),
        nullable=True
    )
    amount_cents: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )
    fee_cents: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False
    )
    status: Mapped[ContractStatus] = mapped_column(
        SAEnum(ContractStatus, name="contract_status_enum", native_enum=False),
        default=ContractStatus.DRAFT,
        nullable=False
    )
    assertion_type: Mapped[AssertionType] = mapped_column(
        SAEnum(AssertionType, name="assertion_type_enum", native_enum=False),
        nullable=False
    )
    assertion_payload: Mapped[dict[str, Any]] = mapped_column(
        JSONBType,
        nullable=False
    )
    result_payload: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONBType,
        nullable=True
    )
    timeout_seconds: Mapped[int] = mapped_column(
        Integer,
        default=300,
        nullable=False
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False
    )
    settled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    payer = relationship("Account", back_populates="payer_contracts", foreign_keys=[payer_id])
    worker = relationship("Account", back_populates="worker_contracts", foreign_keys=[worker_id])
    ledger_entries = relationship("LedgerEntry", back_populates="contract", cascade="all, delete-orphan")
