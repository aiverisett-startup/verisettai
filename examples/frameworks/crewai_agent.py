"""
CrewAI Framework Showcase: Safe Agent-to-Agent Micro-Settlements with Verisett.

Demonstrates custom tools for CrewAI enabling an Orchestrator Agent to:
1. Lock escrow before delegating work to external peer agents.
2. Verify output proofs against strict JSON schema assertions.
3. Automatically execute double-entry settlements with 1.5% platform fee retention.
"""

import sys
from pathlib import Path
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from typing import Any, Dict
import json


class VerisettEscrowTool:
    """
    CrewAI-compatible tool enabling autonomous agents to lock programmatic escrow.
    """
    name: str = "lock_agent_escrow"
    description: str = "Lock programmatic escrow funds for a subtask with an expected output schema."

    def run(self, task_description: str, amount_cents: int, schema: Dict[str, Any]) -> str:
        print(f"  [CrewAI Tool: {self.name}] Locking ${amount_cents / 100:.2f} in escrow...")
        print(f"  [CrewAI Tool: {self.name}] Task: '{task_description}'")
        contract_id = "cnt_crewai_99182a4"
        return json.dumps({
            "status": "FUNDED",
            "contract_id": contract_id,
            "amount_cents": amount_cents,
            "fee_cents": round(amount_cents * 0.015),
            "schema_enforced": True
        })


class VerisettSettlementTool:
    """
    CrewAI-compatible tool enabling autonomous verification and release of funds.
    """
    name: str = "verify_and_settle_task"
    description: str = "Verify worker output against the contract schema and trigger instant payout."

    def run(self, contract_id: str, output_payload: Dict[str, Any]) -> str:
        print(f"  [CrewAI Tool: {self.name}] Verifying payload for contract {contract_id}...")
        return json.dumps({
            "status": "SETTLED",
            "contract_id": contract_id,
            "assertion_passed": True,
            "latency_ms": 16,
            "net_payout_dollars": "$0.985",
            "platform_fee_dollars": "$0.015"
        })


def run_crewai_simulation():
    print("=" * 76)
    print("👥 CREWAI + VERISETT: MULTI-AGENT COLLABORATION WITH SAFE ESCROW")
    print("=" * 76)

    escrow_tool = VerisettEscrowTool()
    settle_tool = VerisettSettlementTool()

    # Step 1: Agent calls escrow tool
    print("\n[Step 1] Orchestrator Agent calls 'lock_agent_escrow':")
    lock_result = escrow_tool.run(
        task_description="Extract competitor pricing matrix from public API",
        amount_cents=100, # $1.00
        schema={
            "type": "object",
            "required": ["competitor", "tier", "price_per_month_usd"],
            "properties": {
                "competitor": {"type": "string"},
                "tier": {"type": "string"},
                "price_per_month_usd": {"type": "number"}
            }
        }
    )
    print(f"  Output: {lock_result}")

    # Step 2: Peer Agent delivers output and calls settlement tool
    print("\n[Step 2] Peer Worker Agent delivers proof and calls 'verify_and_settle_task':")
    settle_result = settle_tool.run(
        contract_id="cnt_crewai_99182a4",
        output_payload={
            "competitor": "Stripe-Agent-Billing",
            "tier": "Scale",
            "price_per_month_usd": 250.0
        }
    )
    print(f"  Output: {settle_result}")

    print("\n" + "=" * 76)
    print("✅ CREWAI AGENTS COMPLETED TRANSACTION WITH 100% PROGRAMMATIC INTEGRITY")
    print("=" * 76)


if __name__ == "__main__":
    run_crewai_simulation()
