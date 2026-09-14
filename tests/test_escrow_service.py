"""
Unit and integration tests for EscrowService state machine and ledger bookkeeping.
"""

from datetime import datetime, timezone, timedelta
import pytest
from verisett.core.config import settings
from verisett.core.constants import ContractStatus, AssertionType, EntryType, AccountRole
from verisett.core.exceptions import (
    InsufficientFundsError,
    ContractStateError,
    SelfClaimNotAllowedError,
    UnauthorizedWorkerError,
    AssertionVerificationFailedError,
)
from verisett.models import Account, Contract, LedgerEntry
from verisett.services.account_service import AccountService
from verisett.services.escrow_service import EscrowService


@pytest.mark.asyncio
async def test_create_and_fund_contract_success(db_session):
    payer, _ = await AccountService.create_account(
        db_session, name="Payer Agent", initial_deposit_cents=20000
    )
    assert payer.balance_cents == 20000
    assert payer.frozen_cents == 0

    contract = await EscrowService.create_and_fund_contract(
        session=db_session,
        payer_id=payer.id,
        amount_cents=10000,
        assertion_type=AssertionType.REGEX,
        assertion_payload={"pattern": r"^PASS.*"},
        timeout_seconds=300,
    )

    assert contract.status == ContractStatus.FUNDED
    assert contract.amount_cents == 10000
    assert contract.fee_cents == 150  # 1.5% of 10000 is 150

    # Payer balance updated
    await db_session.refresh(payer)
    assert payer.balance_cents == 10000
    assert payer.frozen_cents == 10000

    # Ledger entry check
    contract_audit, ledger_entries = await EscrowService.get_contract_with_ledger(
        db_session, contract.id
    )
    assert len(ledger_entries) == 1
    assert ledger_entries[0].entry_type == EntryType.ESCROW_LOCK
    assert ledger_entries[0].amount_cents == 10000


@pytest.mark.asyncio
async def test_create_and_fund_insufficient_balance(db_session):
    payer, _ = await AccountService.create_account(
        db_session, name="Broke Agent", initial_deposit_cents=1000
    )

    with pytest.raises(InsufficientFundsError) as exc_info:
        await EscrowService.create_and_fund_contract(
            session=db_session,
            payer_id=payer.id,
            amount_cents=5000,
            assertion_type=AssertionType.REGEX,
            assertion_payload={"pattern": "test"},
        )
    assert exc_info.value.details["required_cents"] == 5000
    assert exc_info.value.details["available_cents"] == 1000


@pytest.mark.asyncio
async def test_claim_contract_success(db_session):
    payer, _ = await AccountService.create_account(
        db_session, name="Payer 1", initial_deposit_cents=10000
    )
    worker, _ = await AccountService.create_account(
        db_session, name="Worker 1", role=AccountRole.WORKER
    )

    contract = await EscrowService.create_and_fund_contract(
        session=db_session,
        payer_id=payer.id,
        amount_cents=5000,
        assertion_type=AssertionType.REGEX,
        assertion_payload={"pattern": "OK"},
        timeout_seconds=120,
    )

    claimed = await EscrowService.claim_contract(
        session=db_session,
        contract_id=contract.id,
        worker_id=worker.id,
    )

    assert claimed.status == ContractStatus.CLAIMED
    assert claimed.worker_id == worker.id
    assert claimed.expires_at is not None
    # Verify expiration is ~120s from now
    diff = claimed.expires_at - datetime.now(timezone.utc)
    assert 110 <= diff.total_seconds() <= 125


@pytest.mark.asyncio
async def test_self_claim_prevented(db_session):
    payer, _ = await AccountService.create_account(
        db_session, name="Dual Agent", initial_deposit_cents=10000
    )

    contract = await EscrowService.create_and_fund_contract(
        session=db_session,
        payer_id=payer.id,
        amount_cents=5000,
        assertion_type=AssertionType.REGEX,
        assertion_payload={"pattern": "OK"},
    )

    with pytest.raises(SelfClaimNotAllowedError):
        await EscrowService.claim_contract(
            session=db_session,
            contract_id=contract.id,
            worker_id=payer.id,
        )


@pytest.mark.asyncio
async def test_submit_and_settle_full_lifecycle(db_session):
    # Setup Payer, Worker, and Platform treasury
    payer, _ = await AccountService.create_account(
        db_session, name="Data Buyer", initial_deposit_cents=100000  # $1,000.00
    )
    worker, _ = await AccountService.create_account(
        db_session, name="Worker Bot", initial_deposit_cents=0
    )
    platform = await AccountService.get_or_create_platform_account(db_session)
    platform_initial_balance = platform.balance_cents

    amount_cents = 10000  # $100.00
    schema = {
        "type": "object",
        "properties": {
            "prediction": {"type": "string"},
            "accuracy": {"type": "number"}
        },
        "required": ["prediction", "accuracy"]
    }

    # 1. Create and Fund
    contract = await EscrowService.create_and_fund_contract(
        session=db_session,
        payer_id=payer.id,
        amount_cents=amount_cents,
        assertion_type=AssertionType.JSON_SCHEMA,
        assertion_payload={"schema": schema},
        timeout_seconds=300,
    )
    await db_session.refresh(payer)
    assert payer.balance_cents == 90000
    assert payer.frozen_cents == 10000

    # 2. Claim
    await EscrowService.claim_contract(
        session=db_session,
        contract_id=contract.id,
        worker_id=worker.id,
    )

    # 3. Submit valid proof
    output = {"prediction": "BULLISH", "accuracy": 0.94}
    settled_contract, verification = await EscrowService.submit_and_verify(
        session=db_session,
        contract_id=contract.id,
        worker_id=worker.id,
        output_payload=output,
    )

    assert settled_contract.status == ContractStatus.SETTLED
    assert settled_contract.settled_at is not None
    assert verification.passed is True

    # 4. Check balances & 1.5% fee
    await db_session.refresh(payer)
    await db_session.refresh(worker)
    await db_session.refresh(platform)

    expected_fee = round(10000 * 0.015)  # 150 cents ($1.50)
    expected_worker_net = 10000 - expected_fee  # 9850 cents ($98.50)

    assert payer.frozen_cents == 0
    assert payer.balance_cents == 90000
    assert worker.balance_cents == expected_worker_net
    assert platform.balance_cents == platform_initial_balance + expected_fee

    # 5. Check Ledger entries
    _, entries = await EscrowService.get_contract_with_ledger(db_session, contract.id)
    entry_types = [e.entry_type for e in entries]
    assert EntryType.ESCROW_LOCK in entry_types
    assert EntryType.SETTLEMENT_PAYMENT in entry_types
    assert EntryType.FEE_COLLECTION in entry_types

    # Invariant: Total credited from settlement equals contract amount
    settlement_sum = sum(
        e.amount_cents for e in entries if e.entry_type in (EntryType.SETTLEMENT_PAYMENT, EntryType.FEE_COLLECTION)
    )
    assert settlement_sum == amount_cents


@pytest.mark.asyncio
async def test_unauthorized_worker_submission_fails(db_session):
    payer, _ = await AccountService.create_account(
        db_session, name="Payer", initial_deposit_cents=20000
    )
    worker1, _ = await AccountService.create_account(db_session, name="Legit Worker")
    worker2, _ = await AccountService.create_account(db_session, name="Impostor Worker")

    contract = await EscrowService.create_and_fund_contract(
        session=db_session,
        payer_id=payer.id,
        amount_cents=5000,
        assertion_type=AssertionType.REGEX,
        assertion_payload={"pattern": "PASS"},
    )
    await EscrowService.claim_contract(db_session, contract.id, worker1.id)

    with pytest.raises(UnauthorizedWorkerError):
        await EscrowService.submit_and_verify(
            session=db_session,
            contract_id=contract.id,
            worker_id=worker2.id,
            output_payload={"data": "PASS"},
        )


@pytest.mark.asyncio
async def test_expire_and_refund_contract(db_session):
    payer, _ = await AccountService.create_account(
        db_session, name="Payer Agent", initial_deposit_cents=10000
    )
    worker, _ = await AccountService.create_account(db_session, name="Slow Worker")

    contract = await EscrowService.create_and_fund_contract(
        session=db_session,
        payer_id=payer.id,
        amount_cents=8000,
        assertion_type=AssertionType.REGEX,
        assertion_payload={"pattern": "PASS"},
        timeout_seconds=1,
    )
    await EscrowService.claim_contract(db_session, contract.id, worker.id)

    # Force expires_at to be in the past
    contract.expires_at = datetime.now(timezone.utc) - timedelta(seconds=10)
    await db_session.flush()

    refunded = await EscrowService.expire_and_refund(db_session, contract.id)
    assert refunded.status == ContractStatus.REFUNDED

    await db_session.refresh(payer)
    assert payer.frozen_cents == 0
    assert payer.balance_cents == 10000  # Restored full balance

    _, entries = await EscrowService.get_contract_with_ledger(db_session, contract.id)
    refund_entry = [e for e in entries if e.entry_type == EntryType.REFUND]
    assert len(refund_entry) == 1
    assert refund_entry[0].amount_cents == 8000
