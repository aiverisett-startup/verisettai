"""
FastAPI router for Escrow Contract lifecycle.
Endpoints:
- POST /v1/contracts/create
- POST /v1/contracts/{id}/claim
- POST /v1/contracts/{id}/submit
- GET /v1/contracts/{id}/status
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from verisett.core.database import get_db
from verisett.core.exceptions import (
    AccountNotFoundError,
    InsufficientFundsError,
    ContractNotFoundError,
    ContractStateError,
    ContractExpiredError,
    UnauthorizedWorkerError,
    SelfClaimNotAllowedError,
    AssertionVerificationFailedError,
)
from verisett.api.dependencies import get_optional_current_account
from verisett.models.account import Account
from verisett.services.escrow_service import EscrowService
from verisett.schemas.contracts import (
    CreateContractRequest,
    ClaimContractRequest,
    SubmitProofRequest,
    ContractResponse,
    ContractStatusResponse,
)
from verisett.schemas.ledger import LedgerEntryResponse

router = APIRouter(prefix="/contracts", tags=["Contracts"])


@router.post("/create", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def create_contract(
    request: CreateContractRequest,
    current_account: Optional[Account] = Depends(get_optional_current_account),
    session: AsyncSession = Depends(get_db),
):
    """
    Lock programmatic escrow funds from payer's balance and create a FUNDED contract.
    Payer can be inferred from Bearer API key or specified in request.payer_id.
    """
    payer_id = request.payer_id or (current_account.id if current_account else None)
    if not payer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="payer_id must be provided or request must be authenticated with agent API key."
        )

    try:
        contract = await EscrowService.create_and_fund_contract(
            session=session,
            payer_id=payer_id,
            amount_cents=request.amount_cents,
            assertion_type=request.assertion_type,
            assertion_payload=request.assertion_payload,
            timeout_seconds=request.timeout_seconds,
        )
        return contract
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.post("/{contract_id}/claim", response_model=ContractResponse)
async def claim_contract(
    contract_id: str,
    request: Optional[ClaimContractRequest] = None,
    current_account: Optional[Account] = Depends(get_optional_current_account),
    session: AsyncSession = Depends(get_db),
):
    """
    Assign a worker to a FUNDED contract and start the TTL countdown.
    Worker ID can be inferred from Bearer API key or passed in request body.
    """
    req_worker_id = request.worker_id if request else None
    worker_id = req_worker_id or (current_account.id if current_account else None)

    if not worker_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="worker_id must be provided or request must be authenticated with worker API key."
        )

    contract = await EscrowService.claim_contract(
        session=session,
        contract_id=contract_id,
        worker_id=worker_id,
    )
    return contract


@router.post("/{contract_id}/submit", response_model=ContractResponse)
async def submit_and_verify_contract(
    contract_id: str,
    request: SubmitProofRequest,
    current_account: Optional[Account] = Depends(get_optional_current_account),
    session: AsyncSession = Depends(get_db),
):
    """
    Submit task output payload for programmatic verification.
    If valid, executes instant settlement, transfers net amount to worker, and collects 1.5% fee.
    """
    worker_id = request.worker_id or (current_account.id if current_account else None)
    if not worker_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="worker_id must be provided or request must be authenticated with worker API key."
        )

    contract, _ = await EscrowService.submit_and_verify(
        session=session,
        contract_id=contract_id,
        worker_id=worker_id,
        output_payload=request.output_payload,
    )
    return contract


@router.get("/{contract_id}/status", response_model=ContractStatusResponse)
async def get_contract_status(
    contract_id: str,
    session: AsyncSession = Depends(get_db),
):
    """
    Retrieve contract state, timestamps, parameters, and full audit ledger trail.
    """
    contract, ledger_entries = await EscrowService.get_contract_with_ledger(session, contract_id)
    return ContractStatusResponse(
        contract=ContractResponse.model_validate(contract),
        ledger_entries=[LedgerEntryResponse.model_validate(e) for e in ledger_entries],
    )

