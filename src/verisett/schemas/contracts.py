"""
Pydantic v2 schemas for Contract lifecycle requests and responses.
"""

from datetime import datetime
from typing import Any, Optional, Dict, List
from pydantic import BaseModel, Field, ConfigDict
from verisett.core.constants import ContractStatus, AssertionType
from verisett.schemas.ledger import LedgerEntryResponse
from verisett.schemas.assertions import VerificationResult


class CreateContractRequest(BaseModel):
    payer_id: Optional[str] = Field(
        default=None,
        description="ID of the payer account locking funds. Optional if authenticated via Bearer API Key."
    )
    amount_cents: int = Field(
        ...,
        gt=0,
        description="Escrow fund amount in cents (e.g. 10000 = $100.00)."
    )
    assertion_type: AssertionType = Field(
        ...,
        description="Verification mechanism to assert correctness of work."
    )
    assertion_payload: Dict[str, Any] = Field(
        ...,
        description="Assertion rules (e.g., JSON schema, expected hash, regex pattern, or LLM rubric)."
    )
    timeout_seconds: int = Field(
        default=300,
        gt=0,
        le=86400 * 30,
        description="Time-to-live countdown in seconds once claimed."
    )


class ClaimContractRequest(BaseModel):
    worker_id: Optional[str] = Field(
        default=None,
        description="ID of the claiming worker. Optional if authenticated via Bearer API Key."
    )


class SubmitProofRequest(BaseModel):
    worker_id: Optional[str] = Field(
        default=None,
        description="ID of worker submitting work. Optional if authenticated via Bearer API Key."
    )
    output_payload: Dict[str, Any] = Field(
        ...,
        description="Output payload produced by the agent to be verified."
    )


class ContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    payer_id: str
    worker_id: Optional[str]
    amount_cents: int
    fee_cents: int
    status: ContractStatus
    assertion_type: AssertionType
    assertion_payload: Dict[str, Any]
    result_payload: Optional[Dict[str, Any]]
    timeout_seconds: int
    expires_at: Optional[datetime]
    created_at: datetime
    settled_at: Optional[datetime]


class ContractStatusResponse(BaseModel):
    contract: ContractResponse
    ledger_entries: List[LedgerEntryResponse] = Field(default_factory=list)
    verification_details: Optional[VerificationResult] = None
