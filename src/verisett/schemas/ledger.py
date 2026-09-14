"""
Pydantic v2 schemas for ledger entries.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from verisett.core.constants import EntryType


class LedgerEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entry_id: str
    contract_id: Optional[str]
    from_account: str
    to_account: str
    amount_cents: int
    entry_type: EntryType
    created_at: datetime
