"""
Account management and authentication service for Verisett AI Gateway.
"""

import hashlib
import secrets
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from verisett.core.config import settings
from verisett.core.constants import AccountRole, EntryType
from verisett.core.exceptions import AccountNotFoundError
from verisett.models.account import Account
from verisett.models.ledger import LedgerEntry

# Initial free testnet credit grant for developers (500 cents = $5.00)
FREE_TESTNET_CREDIT_CENTS = 500


def hash_api_key(api_key: str) -> str:
    """Computes salted SHA-256 hash of agent API key."""
    salted = f"{settings.API_KEY_SALT}:{api_key}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()


def generate_api_key(prefix: str = "vst_live_") -> str:
    """Generates a high-entropy secret API key for an agent."""
    token = secrets.token_urlsafe(32)
    return f"{prefix}{token}"


class AccountService:
    @staticmethod
    async def get_or_create_platform_account(session: AsyncSession) -> Account:
        """Ensures the platform treasury and fee collection account exists."""
        stmt = select(Account).where(Account.id == settings.PLATFORM_REVENUE_ACCOUNT_ID)
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()

        if not account:
            dummy_key = "platform_treasury_internal_key"
            account = Account(
                id=settings.PLATFORM_REVENUE_ACCOUNT_ID,
                api_key_hash=hash_api_key(dummy_key),
                name=settings.PLATFORM_REVENUE_ACCOUNT_NAME,
                role=AccountRole.DUAL,
                balance_cents=0,
                frozen_cents=0,
                currency="USD",
            )
            session.add(account)
            await session.flush()

        return account

    @staticmethod
    async def create_account(
        session: AsyncSession,
        name: str,
        role: AccountRole = AccountRole.DUAL,
        initial_deposit_cents: int = 0,
        grant_testnet_credits: bool = False,
        currency: str = "USD"
    ) -> Tuple[Account, str]:
        """
        Creates a new agent account and returns the account object with plaintext API key.
        Optionally grants free $5.00 testnet credits upon onboarding.
        """
        # Ensure platform account exists
        await AccountService.get_or_create_platform_account(session)

        raw_api_key = generate_api_key()
        api_key_hash = hash_api_key(raw_api_key)

        starting_balance = initial_deposit_cents
        if grant_testnet_credits and starting_balance == 0:
            starting_balance = FREE_TESTNET_CREDIT_CENTS

        account = Account(
            api_key_hash=api_key_hash,
            name=name,
            role=role,
            balance_cents=starting_balance,
            frozen_cents=0,
            currency=currency,
        )
        session.add(account)
        await session.flush()

        if starting_balance > 0:
            ledger_entry = LedgerEntry(
                contract_id=None,
                from_account=account.id,
                to_account=account.id,
                amount_cents=starting_balance,
                entry_type=EntryType.DEPOSIT,
            )
            session.add(ledger_entry)
            await session.flush()

        return account, raw_api_key

    @staticmethod
    async def get_by_id(session: AsyncSession, account_id: str) -> Account:
        stmt = select(Account).where(Account.id == account_id)
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()
        if not account:
            raise AccountNotFoundError(f"Account with ID '{account_id}' does not exist.")
        return account

    # Alias for get_by_id
    get_account = get_by_id

    @staticmethod
    async def get_by_api_key(session: AsyncSession, api_key: str) -> Account:
        key_hash = hash_api_key(api_key)
        stmt = select(Account).where(Account.api_key_hash == key_hash)
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()
        if not account:
            raise AccountNotFoundError("Invalid API key or account not found.")
        return account

    @staticmethod
    async def deposit(session: AsyncSession, account_id: str, amount_cents: int) -> Account:
        """Deposits funds into an account and writes a ledger entry."""
        if amount_cents <= 0:
            raise ValueError("Deposit amount must be strictly positive.")

        account = await AccountService.get_by_id(session, account_id)
        account.balance_cents += amount_cents

        ledger_entry = LedgerEntry(
            contract_id=None,
            from_account=account.id,
            to_account=account.id,
            amount_cents=amount_cents,
            entry_type=EntryType.DEPOSIT,
        )
        session.add(ledger_entry)
        await session.flush()
        return account

    # Alias for deposit
    deposit_funds = deposit
