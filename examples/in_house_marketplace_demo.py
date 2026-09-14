"""
In-House Worker Marketplace Demonstration Script.

Proves protocol market rails by deploying 3 utility workers:
1. Web Search & Structured Extraction
2. Code Review & Linting
3. Document Summarization

Simulates a beta developer receiving $5.00 in free testnet credits,
routing real external jobs to these workers, shifting funds across the ledger,
and collecting the 1.5% settlement commission.
"""

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from verisett.core.constants import AccountRole, AssertionType
from verisett.core.database import async_engine, get_session_factory, Base
from verisett.services.account_service import AccountService
from verisett.services.escrow_service import EscrowService
from verisett.workers.in_house_workers import (
    InHouseWorkerFleet,
    WebSearchExtractionWorker,
    CodeReviewLintWorker,
    DocSummarizationWorker,
)


async def run_marketplace_demo():
    print("=" * 80)
    print("🚀 VERISETT AI: IN-HOUSE WORKER MARKETPLACE & TESTNET CREDIT SEED")
    print("=" * 80)

    # Initialize tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = get_session_factory()
    fleet = InHouseWorkerFleet()

    async with session_factory() as session:
        # 1. Initialize In-House Worker Fleet
        print("\n[Phase 1] Initializing In-House Utility Worker Fleet...")
        await fleet.initialize(session)
        print("  ✓ Registered Worker: 'Verisett Search & Extraction Worker'")
        print("  ✓ Registered Worker: 'Verisett Code & Security Review Worker'")
        print("  ✓ Registered Worker: 'Verisett Document Summarization Worker'")

        # 2. Onboard Beta Developer with $5.00 Free Testnet Credits
        print("\n[Phase 2] Beta Developer Onboarding...")
        dev_account, dev_key = await AccountService.create_account(
            session=session,
            name="Apex-Autonomous-Labs (Beta Dev)",
            role=AccountRole.PAYER,
            grant_testnet_credits=True, # $5.00 grant
        )
        await session.commit()

        print(f"  ✓ Account ID: {dev_account.id}")
        print(f"  ✓ Initial Balance: ${(dev_account.balance_cents / 100):.2f} (FREE Testnet Credits Allocated)")

        # 3. Route Task 1: Web Search & Structured Extraction ($0.75)
        print("\n[Phase 3] Routing Task 1 -> Web Search & Extraction ($0.75)...")
        c1 = await EscrowService.create_and_fund_contract(
            session=session,
            payer_id=dev_account.id,
            amount_cents=75,
            assertion_type=AssertionType.JSON_SCHEMA,
            assertion_payload={
                "task_description": "Search latest autonomous payments benchmarks",
                "schema": WebSearchExtractionWorker.get_expected_schema()
            },
            timeout_seconds=300,
        )
        await session.commit()
        print(f"  • Escrow Locked: {c1.id} ($0.75)")

        r1 = await fleet.claim_and_execute_task(
            session=session,
            contract_id=c1.id,
            capability=WebSearchExtractionWorker.CAPABILITY,
            input_data={"query": "State of Autonomous Agent Commerce 2026"}
        )
        print(f"  ✓ Claimed & Verified by: {r1['worker_name']}")
        print(f"  ✓ Settled Net: ${(r1['worker_payout_cents'] / 100):.2f} | Fee: ${(r1['platform_fee_cents'] / 100):.2f}")

        # 4. Route Task 2: Code Review & Linting ($1.50)
        print("\n[Phase 4] Routing Task 2 -> Code Review & Security Audit ($1.50)...")
        c2 = await EscrowService.create_and_fund_contract(
            session=session,
            payer_id=dev_account.id,
            amount_cents=150,
            assertion_type=AssertionType.JSON_SCHEMA,
            assertion_payload={
                "task_description": "Audit FastAPI settlement endpoint for double-spending",
                "schema": CodeReviewLintWorker.get_expected_schema()
            },
            timeout_seconds=300,
        )
        await session.commit()
        print(f"  • Escrow Locked: {c2.id} ($1.50)")

        r2 = await fleet.claim_and_execute_task(
            session=session,
            contract_id=c2.id,
            capability=CodeReviewLintWorker.CAPABILITY,
            input_data={"language": "python", "code": "async def transfer(payer, worker, amt): ..."}
        )
        print(f"  ✓ Claimed & Verified by: {r2['worker_name']}")
        print(f"  ✓ Settled Net: ${(r2['worker_payout_cents'] / 100):.2f} | Fee: ${(r2['platform_fee_cents'] / 100):.2f}")

        # 5. Route Task 3: Document Summarization ($1.00)
        print("\n[Phase 5] Routing Task 3 -> Document Summarization ($1.00)...")
        c3 = await EscrowService.create_and_fund_contract(
            session=session,
            payer_id=dev_account.id,
            amount_cents=100,
            assertion_type=AssertionType.JSON_SCHEMA,
            assertion_payload={
                "task_description": "Summarize Verisett clearinghouse whitepaper",
                "schema": DocSummarizationWorker.get_expected_schema()
            },
            timeout_seconds=300,
        )
        await session.commit()
        print(f"  • Escrow Locked: {c3.id} ($1.00)")

        r3 = await fleet.claim_and_execute_task(
            session=session,
            contract_id=c3.id,
            capability=DocSummarizationWorker.CAPABILITY,
            input_data={"title": "Autonomous Clearinghouse Whitepaper"}
        )
        print(f"  ✓ Claimed & Verified by: {r3['worker_name']}")
        print(f"  ✓ Settled Net: ${(r3['worker_payout_cents'] / 100):.2f} | Fee: ${(r3['platform_fee_cents'] / 100):.2f}")

        # 6. Global Ledger Balance & Take-Rate Summary
        print("\n[Phase 6] Protocol Ledger Reconciliation...")
        dev_updated = await AccountService.get_account(session, dev_account.id)
        total_escrow_settled = 75 + 150 + 100
        total_fees = r1['platform_fee_cents'] + r2['platform_fee_cents'] + r3['platform_fee_cents']

        print(f"  • Developer Initial Grant:    $5.00 (500 cents)")
        print(f"  • Total Tasks Executed:       3 contracts ($3.25 gross volume)")
        print(f"  • Developer Remaining Credit: ${(dev_updated.balance_cents / 100):.2f} (500 - 325 = 175 cents)")
        print(f"  • In-House Workers Received:  ${((total_escrow_settled - total_fees) / 100):.2f} net")
        print(f"  • Platform Treasury Revenue:  ${(total_fees / 100):.2f} (1.5% take-rate)")

        assert dev_updated.balance_cents == 175, f"Expected 175 cents, got {dev_updated.balance_cents}"
        assert dev_updated.frozen_cents == 0, f"Expected 0 frozen, got {dev_updated.frozen_cents}"
        print("\n" + "=" * 80)
        print("✅ MARKETPLACE RAILS VALIDATED: SEED AGENTS PROVED CONTINUOUS CLEARING!")
        print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_marketplace_demo())
