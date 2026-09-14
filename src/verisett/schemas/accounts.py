"""
Pydantic v2 schemas for accounts and balance operations.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from verisett.core.constants import AccountRole


class CreateAccountRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Human/Agent recognizable name")
    role: AccountRole = Field(default=AccountRole.DUAL, description="Account role: payer, worker, or dual")
    initial_deposit_cents: int = Field(default=0, ge=0, description="Initial balance to deposit in cents")
    currency: str = Field(default="USD", max_length=10, description="Currency code, e.g. USD")


class DepositRequest(BaseModel):
    amount_cents: int = Field(..., gt=0, description="Amount in cents to deposit")


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    role: AccountRole
    balance_cents: int
    frozen_cents: int
    currency: str
    created_at: datetime
    updated_at: datetime


class AccountCreatedResponse(AccountResponse):
    api_key: str = Field(..., description="Secret API key for this agent. Only returned upon creation.")
