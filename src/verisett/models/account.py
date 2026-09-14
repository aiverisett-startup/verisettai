"""
SQLAlchemy 2.0 Account model for Verisett AI.
"""

import uuid
from sqlalchemy import (
    String,
    BigInteger,
    Enum as SAEnum,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from verisett.core.database import Base
from verisett.core.constants import AccountRole
from verisett.models.base import TimestampMixin, utc_now


class Account(Base, TimestampMixin):
    __tablename__ = "accounts"
    __table_args__ = (
        CheckConstraint("balance_cents >= 0", name="chk_balance_non_negative"),
        CheckConstraint("frozen_cents >= 0", name="chk_frozen_non_negative"),
        Index("ix_accounts_api_key_hash", "api_key_hash", unique=True),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    api_key_hash: Mapped[str] = mapped_column(
        String(128),
        nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    role: Mapped[AccountRole] = mapped_column(
        SAEnum(AccountRole, name="account_role_enum", native_enum=False),
        default=AccountRole.DUAL,
        nullable=False
    )
    balance_cents: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False
    )
    frozen_cents: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        default="USD",
        nullable=False
    )

    # Relationships
    payer_contracts = relationship("Contract", back_populates="payer", foreign_keys="Contract.payer_id")
    worker_contracts = relationship("Contract", back_populates="worker", foreign_keys="Contract.worker_id")

    @property
    def total_cents(self) -> int:
        return self.balance_cents + self.frozen_cents
