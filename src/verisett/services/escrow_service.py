"""
Core Escrow & Settlement Service for Verisett AI Gateway.
Implements ACID state machine transitions, row-level locking, and double-entry bookkeeping.
"""

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from verisett.core.config import settings
from verisett.core.constants import ContractStatus, AssertionType, EntryType
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
from verisett.models.account import Account
from verisett.models.contract import Contract
from verisett.models.ledger import LedgerEntry
from verisett.models.base import to_utc_aware
from verisett.services.account_service import AccountService
from verisett.services.verifier_service import VerifierService
from verisett.schemas.assertions import VerificationResult


def _apply_for_update(stmt, session: AsyncSession):
    """Applies row-level lock SELECT ... FOR UPDATE on supported dialects (e.g. PostgreSQL)."""
    bind = session.bind
    if bind is None and hasattr(session, "get_bind"):
        try:
            bind = session.get_bind()
        except Exception:
            bind = None
    if bind is not None and getattr(bind, "dialect", None) and bind.dialect.name in ("postgresql", "mysql"):
        return stmt.with_for_update()
    return stmt



class EscrowService:
    @staticmethod
    async def create_and_fund_contract(
        session: AsyncSession,
        payer_id: str,
        amount_cents: int,
        assertion_type: AssertionType,
        assertion_payload: Dict[str, Any],
        timeout_seconds: int = 300,
    ) -> Contract:
        """
        Atomically locks funds in escrow and creates a FUNDED contract.
        1. Row-lock payer account.
        2. Verify available balance >= amount_cents.
        3. Deduct from available balance, add to frozen balance.
        4. Create contract and ESCROW_LOCK ledger entry.
        """
        if amount_cents <= 0:
            raise ValueError("Escrow amount must be strictly positive.")

        # Ensure platform account exists
        await AccountService.get_or_create_platform_account(session)

        # 1. Lock payer row
        stmt = select(Account).where(Account.id == payer_id)
        stmt = _apply_for_update(stmt, session)
        result = await session.execute(stmt)
        payer = result.scalar_one_or_none()

        if not payer:
            raise AccountNotFoundError(f"Payer account '{payer_id}' not found.")

        # 2. Check sufficient balance
        if payer.balance_cents < amount_cents:
            raise InsufficientFundsError(
                account_id=payer.id,
                required_cents=amount_cents,
                available_cents=payer.balance_cents
            )

        # 3. Transfer from available to frozen
        payer.balance_cents -= amount_cents
        payer.frozen_cents += amount_cents

        # Calculate 1.5% take-rate platform fee
        fee_cents = round(amount_cents * settings.PLATFORM_FEE_RATE)

        # 4. Create Contract
        contract = Contract(
            payer_id=payer.id,
            worker_id=None,
            amount_cents=amount_cents,
            fee_cents=fee_cents,
            status=ContractStatus.FUNDED,
            assertion_type=assertion_type,
            assertion_payload=assertion_payload,
            result_payload=None,
            timeout_seconds=timeout_seconds,
            expires_at=None,  # Activated upon claiming
        )
        session.add(contract)
        await session.flush()

        # Record Ledger Entry: ESCROW_LOCK
        lock_entry = LedgerEntry(
            contract_id=contract.id,
            from_account=payer.id,
            to_account=payer.id,
            amount_cents=amount_cents,
            entry_type=EntryType.ESCROW_LOCK,
        )
        session.add(lock_entry)
        await session.flush()

        return contract

    @staticmethod
    async def claim_contract(
        session: AsyncSession,
        contract_id: str,
        worker_id: str,
    ) -> Contract:
        """
        Atomically assigns a worker to a FUNDED contract and starts the TTL countdown.
        """
        # Lock contract row
        contract_stmt = select(Contract).where(Contract.id == contract_id)
        contract_stmt = _apply_for_update(contract_stmt, session)
        res = await session.execute(contract_stmt)
        contract = res.scalar_one_or_none()

        if not contract:
            raise ContractNotFoundError(contract_id)

        if contract.status != ContractStatus.FUNDED:
            raise ContractStateError(
                contract_id=contract.id,
                current_status=contract.status.value,
                expected_status=ContractStatus.FUNDED.value,
                action="claim"
            )

        # Check worker exists
        worker_stmt = select(Account).where(Account.id == worker_id)
        worker_stmt = _apply_for_update(worker_stmt, session)
        w_res = await session.execute(worker_stmt)
        worker = w_res.scalar_one_or_none()

        if not worker:
            raise AccountNotFoundError(f"Worker account '{worker_id}' not found.")

        # Prevent payer from claiming their own contract
        if contract.payer_id == worker_id:
            raise SelfClaimNotAllowedError(contract_id=contract.id, payer_id=contract.payer_id)

        now = datetime.now(timezone.utc)
        contract.worker_id = worker.id
        contract.status = ContractStatus.CLAIMED
        contract.expires_at = now + timedelta(seconds=contract.timeout_seconds)

        await session.flush()
        return contract

    @staticmethod
    async def submit_and_verify(
        session: AsyncSession,
        contract_id: str,
        worker_id: str,
        output_payload: Dict[str, Any],
    ) -> Tuple[Contract, VerificationResult]:
        """
        Validates worker's output against contract assertion.
        If valid, executes instant atomic settlement:
        - Deducts 1.5% fee for platform revenue.
        - Transfers net balance to worker.
        - Updates contract to SETTLED and records ledger entries.
        """
        # 1. Lock contract
        contract_stmt = select(Contract).where(Contract.id == contract_id)
        contract_stmt = _apply_for_update(contract_stmt, session)
        res = await session.execute(contract_stmt)
        contract = res.scalar_one_or_none()

        if not contract:
            raise ContractNotFoundError(contract_id)

        if contract.status not in (ContractStatus.CLAIMED, ContractStatus.DISPUTED):
            raise ContractStateError(
                contract_id=contract.id,
                current_status=contract.status.value,
                expected_status=f"{ContractStatus.CLAIMED.value} or {ContractStatus.DISPUTED.value}",
                action="submit"
            )

        if contract.worker_id != worker_id:
            raise UnauthorizedWorkerError(
                contract_id=contract.id,
                expected_worker=contract.worker_id or "unassigned",
                actual_worker=worker_id
            )

        now = datetime.now(timezone.utc)
        expires_at_utc = to_utc_aware(contract.expires_at)
        if expires_at_utc and now > expires_at_utc:
            raise ContractExpiredError(
                contract_id=contract.id,
                expired_at=expires_at_utc.isoformat()
            )

        contract.result_payload = output_payload

        # 2. Run Assertion Verification
        verification = VerifierService.verify(
            assertion_type=contract.assertion_type,
            assertion_payload=contract.assertion_payload,
            output_payload=output_payload
        )

        if not verification.passed:
            contract.status = ContractStatus.DISPUTED
            await session.commit()
            raise AssertionVerificationFailedError(
                assertion_type=contract.assertion_type.value,
                reason=verification.reason,
                details=verification.details
            )

        # 3. Execution of Settlement
        # Lock Payer, Worker, and Platform accounts
        payer_stmt = select(Account).where(Account.id == contract.payer_id)
        payer_stmt = _apply_for_update(payer_stmt, session)
        p_res = await session.execute(payer_stmt)
        payer = p_res.scalar_one()

        worker_stmt = select(Account).where(Account.id == contract.worker_id)
        worker_stmt = _apply_for_update(worker_stmt, session)
        w_res = await session.execute(worker_stmt)
        worker = w_res.scalar_one()

        platform = await AccountService.get_or_create_platform_account(session)
        plat_stmt = select(Account).where(Account.id == platform.id)
        plat_stmt = _apply_for_update(plat_stmt, session)
        plat_res = await session.execute(plat_stmt)
        platform_acc = plat_res.scalar_one()

        amount_cents = contract.amount_cents
        fee_cents = contract.fee_cents
        worker_net_cents = amount_cents - fee_cents

        # Payer frozen funds are unfrozen and transferred out
        payer.frozen_cents -= amount_cents

        # Worker credited net amount
        worker.balance_cents += worker_net_cents

        # Platform credited take-rate fee
        platform_acc.balance_cents += fee_cents

        # Record Double-entry ledger movements
        entry_worker = LedgerEntry(
            contract_id=contract.id,
            from_account=payer.id,
            to_account=worker.id,
            amount_cents=worker_net_cents,
            entry_type=EntryType.SETTLEMENT_PAYMENT,
        )
        session.add(entry_worker)

        if fee_cents > 0:
            entry_fee = LedgerEntry(
                contract_id=contract.id,
                from_account=payer.id,
                to_account=platform_acc.id,
                amount_cents=fee_cents,
                entry_type=EntryType.FEE_COLLECTION,
            )
            session.add(entry_fee)

        contract.status = ContractStatus.SETTLED
        contract.settled_at = now
        await session.flush()

        return contract, verification

    @staticmethod
    async def expire_and_refund(
        session: AsyncSession,
        contract_id: str,
    ) -> Contract:
        """
        Releases frozen escrow funds back to payer if contract has expired.
        """
        contract_stmt = select(Contract).where(Contract.id == contract_id)
        contract_stmt = _apply_for_update(contract_stmt, session)
        res = await session.execute(contract_stmt)
        contract = res.scalar_one_or_none()

        if not contract:
            raise ContractNotFoundError(contract_id)

        if contract.status not in (ContractStatus.FUNDED, ContractStatus.CLAIMED):
            raise ContractStateError(
                contract_id=contract.id,
                current_status=contract.status.value,
                expected_status=f"{ContractStatus.FUNDED.value} or {ContractStatus.CLAIMED.value}",
                action="refund"
            )

        now = datetime.now(timezone.utc)
        expires_at_utc = to_utc_aware(contract.expires_at)
        if contract.status == ContractStatus.CLAIMED and expires_at_utc and now < expires_at_utc:
            raise ValueError(f"Contract {contract_id} has not yet expired (expires at {expires_at_utc.isoformat()}).")

        payer_stmt = select(Account).where(Account.id == contract.payer_id)
        payer_stmt = _apply_for_update(payer_stmt, session)
        p_res = await session.execute(payer_stmt)
        payer = p_res.scalar_one()

        # Unfreeze funds back to payer available balance
        payer.frozen_cents -= contract.amount_cents
        payer.balance_cents += contract.amount_cents

        contract.status = ContractStatus.REFUNDED

        # Record Ledger Entry: REFUND
        refund_entry = LedgerEntry(
            contract_id=contract.id,
            from_account=payer.id,
            to_account=payer.id,
            amount_cents=contract.amount_cents,
            entry_type=EntryType.REFUND,
        )
        session.add(refund_entry)
        await session.flush()

        return contract

    @staticmethod
    async def get_contract_with_ledger(
        session: AsyncSession,
        contract_id: str
    ) -> Tuple[Contract, List[LedgerEntry]]:
        """Retrieves a contract and its audit trail of ledger entries."""
        contract_stmt = select(Contract).where(Contract.id == contract_id)
        res = await session.execute(contract_stmt)
        contract = res.scalar_one_or_none()

        if not contract:
            raise ContractNotFoundError(contract_id)

        ledger_stmt = (
            select(LedgerEntry)
            .where(LedgerEntry.contract_id == contract_id)
            .order_by(LedgerEntry.created_at.asc())
        )
        ledger_res = await session.execute(ledger_stmt)
        entries = list(ledger_res.scalars().all())

        return contract, entries
