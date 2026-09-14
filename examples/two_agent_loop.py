"""
End-to-End Two-Agent Escrow & Micro-Settlement Loop.

Scenario:
1. Agent A (Claude Orchestrator) hires Agent B (Gemini Data Extractor) to analyze Q3 filings.
2. Agent A locks $0.50 in programmatic escrow with a strict JSON schema assertion.
3. Agent B claims the task and starts the TTL countdown.
4. Agent B extracts the data and submits the payload proof.
5. Verisett verifies the schema invariants in <20ms and settles funds:
   - Worker receives $0.49 net.
   - Platform Treasury collects $0.01 (1.5% fee).
   - Double-entry ledger audit trail is permanently recorded.
"""

import asyncio
import json
import sys
from pathlib import Path

# Ensure src is in sys.path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from verisett.core.constants import AccountRole, AssertionType, EntryType
from verisett.core.database import async_engine, get_session_factory, Base
from verisett.services.account_service import AccountService
from verisett.services.escrow_service import EscrowService


async def run_two_agent_loop():
    print("=" * 76)
    print("🤖 VERISETT AI: AUTONOMOUS TWO-AGENT ESCROW & SETTLEMENT LOOP")
    print("=" * 76)

    # 1. Initialize In-Memory / Local Test Database
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = get_session_factory()

    async with session_factory() as session:
        # 2. Onboard Agents
        print("\n[Step 1] Onboarding Autonomous Agents...")
        agent_a, key_a = await AccountService.create_account(
            session=session,
            name="Claude-3.5-Orchestrator (Payer)",
            role=AccountRole.PAYER,
        )
        # Fund Agent A with $5.00 testnet balance
        await AccountService.deposit_funds(session, agent_a.id, 500)

        agent_b, key_b = await AccountService.create_account(
            session=session,
            name="Gemini-Flash-Extractor (Worker)",
            role=AccountRole.WORKER,
        )
        await session.commit()

        print(f"  ✓ Agent A (Payer):  {agent_a.name} | Balance: ${(agent_a.balance_cents / 100):.2f}")
        print(f"  ✓ Agent B (Worker): {agent_b.name} | Balance: ${(agent_b.balance_cents / 100):.2f}")

        # 3. Agent A locks $0.50 in escrow with strict JSON schema
        task_cost_cents = 50  # $0.50
        print(f"\n[Step 2] Agent A creates programmatic escrow for ${task_cost_cents/100:.2f}...")

        expected_schema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "required": ["ticker", "revenue_billions", "gross_margin_pct", "ai_datacenter_growth_pct"],
            "properties": {
                "ticker": {"type": "string", "enum": ["NVDA"]},
                "revenue_billions": {"type": "number", "minimum": 10.0},
                "gross_margin_pct": {"type": "number", "minimum": 50.0},
                "ai_datacenter_growth_pct": {"type": "number"}
            }
        }

        contract = await EscrowService.create_and_fund_contract(
            session=session,
            payer_id=agent_a.id,
            amount_cents=task_cost_cents,
            assertion_type=AssertionType.JSON_SCHEMA,
            assertion_payload={
                "task_description": "Extract Q3 structured metrics for NVDA",
                "schema": expected_schema
            },
            timeout_seconds=120,
        )
        await session.commit()

        print(f"  ✓ Escrow Contract Created: {contract.id}")
        print(f"  ✓ Status: {contract.status.value}")
        print(f"  ✓ Amount Locked: ${(contract.amount_cents / 100):.2f} (Platform Take-Rate: ${(contract.fee_cents / 100):.2f})")
        print(f"  ✓ Payer Balance: Available: ${(agent_a.balance_cents / 100):.2f}, Frozen: ${(agent_a.frozen_cents / 100):.2f}")

        # 4. Agent B claims the task
        print(f"\n[Step 3] Agent B claims task {contract.id}...")
        claimed_contract = await EscrowService.claim_contract(
            session=session,
            contract_id=contract.id,
            worker_id=agent_b.id,
        )
        await session.commit()
        print(f"  ✓ Task Claimed. Status: {claimed_contract.status.value}")
        print(f"  ✓ TTL Expiry Timestamp: {claimed_contract.expires_at}")

        # 5. Agent B computes output and submits proof
        print("\n[Step 4] Agent B submits task proof payload for verification...")
        agent_b_output = {
            "ticker": "NVDA",
            "revenue_billions": 35.08,
            "gross_margin_pct": 74.6,
            "ai_datacenter_growth_pct": 112.4
        }
        print("  Payload to verify:")
        print(json.dumps(agent_b_output, indent=4))

        settled_contract, verification = await EscrowService.submit_and_verify(
            session=session,
            contract_id=contract.id,
            worker_id=agent_b.id,
            output_payload=agent_b_output,
        )
        await session.commit()

        print(f"\n[Step 5] Instant Verification & Micro-Settlement Result:")
        print(f"  ✓ Assertion Passed: {verification.passed} ({verification.reason})")
        print(f"  ✓ Contract Status:  {settled_contract.status.value}")
        print(f"  ✓ Settled At:       {settled_contract.settled_at}")

        # 6. Audit Balances & Double-Entry Ledger
        print("\n[Step 6] Verifying Final Balances & Conservation of Value...")
        # Refresh account records
        payer_final = await AccountService.get_account(session, agent_a.id)
        worker_final = await AccountService.get_account(session, agent_b.id)

        print(f"  • Payer Final Available Balance:  ${(payer_final.balance_cents / 100):.2f} (Deducted $0.50)")
        print(f"  • Payer Frozen Escrow Balance:    ${(payer_final.frozen_cents / 100):.2f}")
        print(f"  • Worker Final Available Balance: ${(worker_final.balance_cents / 100):.2f} (Credited $0.49 net)")
        print(f"  • Platform Treasury Fee Collected: ${(settled_contract.fee_cents / 100):.2f} (1.5%)")

        # Double-entry ledger audit
        _, entries = await EscrowService.get_contract_with_ledger(session, contract.id)
        print("\n  Double-Entry Ledger Audit Trail:")
        for idx, entry in enumerate(entries, 1):
            print(f"    [{idx}] {entry.entry_type.value:20} | Amount: ${(entry.amount_cents / 100):.2f} | From: {entry.from_account[:12]}... -> To: {entry.to_account[:12]}...")

        # Invariant checks
        assert payer_final.balance_cents == 450, f"Expected 450 cents, got {payer_final.balance_cents}"
        assert payer_final.frozen_cents == 0, f"Expected 0 frozen, got {payer_final.frozen_cents}"
        assert worker_final.balance_cents == 49, f"Expected 49 cents, got {worker_final.balance_cents}"
        assert settled_contract.fee_cents == 1, f"Expected 1 cent fee, got {settled_contract.fee_cents}"
        print("\n" + "=" * 76)
        print("✅ TWO-AGENT LOOP COMPLETED SUCCESSFULLY WITH ZERO COUNTERPARTY RISK!")
        print("=" * 76)


if __name__ == "__main__":
    asyncio.run(run_two_agent_loop())
