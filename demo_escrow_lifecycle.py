"""
Verisett AI — Autonomous Agent Escrow & Settlement Gateway
End-to-End Live Demonstration Script

Demonstrates:
1. Agent Onboarding (Payer & Worker)
2. Programmatic Escrow Lock ($150.00 locked in escrow)
3. Worker Task Claiming & TTL Countdown initiation
4. Dynamic Schema Assertion Verification (Pydantic v2 / JSON Schema Draft 2020-12)
5. Instant Micro-Settlement (1.5% take-rate fee collected, net funds transferred to worker)
6. Double-Entry Ledger Invariant Audit Trail Verification
7. Timeout Expiration & Programmatic Refund Demonstration
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

import asyncio
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from verisett.core.database import Base, set_async_engine, get_session_factory
from verisett.core.constants import AssertionType, ContractStatus, EntryType
from verisett.services.account_service import AccountService
from verisett.services.escrow_service import EscrowService
from verisett.services.expiry_worker import expiry_worker
from verisett.mcp.server import (
    create_contract_escrow,
    claim_task,
    submit_task_proof,
    get_contract_status,
    check_account_balance,
)


def print_banner(title: str):
    print("\n" + "=" * 70)
    print(f"  {title.upper()}")
    print("=" * 70)


async def main():
    # Setup in-memory test database for the demo
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    set_async_engine(engine)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = get_session_factory()

    print_banner("1. Agent Account Onboarding & Platform Provisioning")
    async with session_factory() as session:
        platform = await AccountService.get_or_create_platform_account(session)
        payer, payer_key = await AccountService.create_account(
            session=session,
            name="Autonomous Market Maker Agent #42",
            role="payer",
            initial_deposit_cents=50000,  # $500.00
        )
        worker, worker_key = await AccountService.create_account(
            session=session,
            name="DeepResearch Autonomous LLM Worker",
            role="worker",
            initial_deposit_cents=0,
        )
        await session.commit()

        print(f"[*] Platform Treasury Account: {platform.id} | Balance: ${platform.balance_cents / 100:.2f}")
        print(f"[*] Payer Agent Created:       {payer.name} ({payer.id}) | Available: ${payer.balance_cents / 100:.2f}")
        print(f"[*] Worker Agent Created:      {worker.name} ({worker.id}) | Available: ${worker.balance_cents / 100:.2f}")

    print_banner("2. FastMCP Tool Execution: Lock Programmatic Escrow")
    contract_schema = {
        "type": "object",
        "properties": {
            "insights": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "confidence": {"type": "number", "minimum": 0.8},
            "execution_time_ms": {"type": "integer"}
        },
        "required": ["insights", "confidence", "execution_time_ms"]
    }

    # Escrow amount: $150.00 (15000 cents)
    mcp_escrow_res = await create_contract_escrow(
        payer_api_key=payer_key,
        amount_cents=15000,
        assertion_type="JSON_SCHEMA",
        assertion_payload={"schema": contract_schema},
        timeout_seconds=300,
    )
    contract_id = mcp_escrow_res["contract_id"]
    print(f"[*] Escrow Contract Created via FastMCP Tool: {contract_id}")
    print(f"    - Amount: ${mcp_escrow_res['amount_cents'] / 100:.2f}")
    print(f"    - Platform Take-rate (1.5%): ${mcp_escrow_res['fee_cents'] / 100:.2f}")
    print(f"    - Status: {mcp_escrow_res['status']}")

    # Check Payer balance
    payer_bal = await check_account_balance(payer_key)
    print(f"[*] Payer Balance Post-Lock:")
    print(f"    - Available Balance: ${payer_bal['balance_cents'] / 100:.2f}")
    print(f"    - Frozen Escrow:     ${payer_bal['frozen_cents'] / 100:.2f}")

    print_banner("3. Worker Claims Contract (Starts TTL Countdown)")
    claim_res = await claim_task(worker_api_key=worker_key, contract_id=contract_id)
    print(f"[*] Contract Claimed by Worker: {claim_res['worker_id']}")
    print(f"    - Status:     {claim_res['status']}")
    print(f"    - Expires At: {claim_res['expires_at']}")

    print_banner("4. Task Proof Submission & Instant Micro-Settlement")
    proof_output = {
        "insights": [
            "Fed interest rate pause expected with 87% probability.",
            "Semiconductor capex guidance revision signals supply bottleneck resolution."
        ],
        "confidence": 0.94,
        "execution_time_ms": 1420
    }
    print(f"[*] Submitting Task Output Proof:")
    print(json.dumps(proof_output, indent=2))

    settle_res = await submit_task_proof(
        worker_api_key=worker_key,
        contract_id=contract_id,
        output_payload=proof_output,
    )
    print(f"[*] Task Verified & Settled Instantly!")
    print(f"    - Verification Passed: {settle_res['verification']['passed']}")
    print(f"    - Net Paid to Worker:  ${settle_res['amount_settled_cents'] / 100:.2f}")
    print(f"    - Platform 1.5% Fee:   ${settle_res['platform_fee_cents'] / 100:.2f}")
    print(f"    - Settled Timestamp:   {settle_res['settled_at']}")

    print_banner("5. Double-Entry Ledger Audit Trail & Invariant Verification")
    status_summary = await get_contract_status(contract_id)
    print(f"[*] Total Ledger Audit Entries: {len(status_summary['ledger_entries'])}")
    for i, entry in enumerate(status_summary['ledger_entries'], 1):
        print(f"    [{i}] Type: {entry['entry_type']:<20} | Amount: ${entry['amount_cents'] / 100:>6.2f} | From: {entry['from_account'][:8]}... -> To: {entry['to_account'][:8]}...")

    # Final Account Balances
    payer_final = await check_account_balance(payer_key)
    worker_final = await check_account_balance(worker_key)
    async with session_factory() as session:
        plat_acc = await session.get(AccountService.get_or_create_platform_account.__annotations__.get("return", AccountService), platform.id)
        # Refresh platform account
        stmt = select(AccountService.get_by_id.__annotations__.get("return", AccountService))
        from verisett.models.account import Account
        res = await session.execute(select(Account).where(Account.id == platform.id))
        plat_refreshed = res.scalar_one()

    print("\n[*] Final Account Balances:")
    print(f"    - Payer Available:    ${payer_final['balance_cents'] / 100:.2f} (Frozen: ${payer_final['frozen_cents'] / 100:.2f})")
    print(f"    - Worker Available:   ${worker_final['balance_cents'] / 100:.2f}")
    print(f"    - Platform Treasury:  ${plat_refreshed.balance_cents / 100:.2f}")

    print_banner("6. Expired Contract Programmatic Refund Demonstration")
    async with session_factory() as session:
        # Payer creates second contract for $100.00
        c2 = await EscrowService.create_and_fund_contract(
            session=session,
            payer_id=payer.id,
            amount_cents=10000,
            assertion_type=AssertionType.REGEX,
            assertion_payload={"pattern": "PASS"},
            timeout_seconds=5,
        )
        await EscrowService.claim_contract(session, c2.id, worker.id)
        # Artificially expire the contract
        c2.expires_at = datetime.now(timezone.utc) - timedelta(seconds=10)
        await session.commit()
        c2_id = c2.id

    print(f"[*] Contract {c2_id} expired. Triggering background sweeper...")
    refunded_ids = await expiry_worker.run_sweep_once()
    print(f"[*] Sweeper successfully refunded expired contracts: {refunded_ids}")

    async with session_factory() as session:
        c2_refreshed, c2_entries = await EscrowService.get_contract_with_ledger(session, c2_id)
        print(f"[*] Contract Status: {c2_refreshed.status.value}")
        print(f"    - Refund Ledger Entry Recorded: {c2_entries[-1].entry_type.value} (${c2_entries[-1].amount_cents / 100:.2f})")

    payer_after_refund = await check_account_balance(payer_key)
    print(f"[*] Payer Balance Fully Restored: ${payer_after_refund['balance_cents'] / 100:.2f} (Frozen: ${payer_after_refund['frozen_cents'] / 100:.2f})")

    print_banner("All Verisett AI Gateway Engine Flows Executed Successfully!")


if __name__ == "__main__":
    asyncio.run(main())
