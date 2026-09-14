"""
FastAPI router for account management and balances.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from verisett.core.database import get_db
from verisett.core.exceptions import AccountNotFoundError
from verisett.api.dependencies import get_current_account
from verisett.models.account import Account
from verisett.services.account_service import AccountService
from verisett.schemas.accounts import (
    CreateAccountRequest,
    AccountResponse,
    AccountCreatedResponse,
    DepositRequest,
)

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.post("/create", response_model=AccountCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    request: CreateAccountRequest,
    session: AsyncSession = Depends(get_db),
):
    """
    Onboard an agent (payer, worker, or dual).
    Returns the account profile along with its unique, secret API key.
    """
    account, api_key = await AccountService.create_account(
        session=session,
        name=request.name,
        role=request.role,
        initial_deposit_cents=request.initial_deposit_cents,
        currency=request.currency,
    )
    return AccountCreatedResponse(
        id=account.id,
        name=account.name,
        role=account.role,
        balance_cents=account.balance_cents,
        frozen_cents=account.frozen_cents,
        currency=account.currency,
        created_at=account.created_at,
        updated_at=account.updated_at,
        api_key=api_key,
    )


@router.get("/me", response_model=AccountResponse)
async def get_my_account(
    current_account: Account = Depends(get_current_account),
):
    """Get the authenticated agent's account profile and current balances."""
    return current_account


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account_by_id(
    account_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Lookup account details by ID."""
    try:
        return await AccountService.get_by_id(session, account_id)
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{account_id}/deposit", response_model=AccountResponse)
async def deposit_funds(
    account_id: str,
    request: DepositRequest,
    session: AsyncSession = Depends(get_db),
):
    """Deposit balance in cents to an account for testing and escrow funding."""
    try:
        return await AccountService.deposit(session, account_id, request.amount_cents)
    except AccountNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
