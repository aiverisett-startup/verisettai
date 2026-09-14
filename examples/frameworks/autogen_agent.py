"""
Microsoft AutoGen Showcase: Autonomous Agent Contracts & Settlements with Verisett.

Demonstrates how two AutoGen ConversableAgents interact over Verisett rails:
- ClientAgent creates a verifiable task and deposits funds in escrow.
- WorkerAgent generates answers.
- Verisett intercepts the conversation, verifies the structured reply against
  the contract schema, and executes the micro-settlement.
"""

import sys
from pathlib import Path
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from typing import Any, Dict
import json


class AutoGenVerisettBridge:
    """Hooks into AutoGen conversation messages to enforce programmatic escrow."""

    @staticmethod
    def intercept_proposal(message: Dict[str, Any], cost_cents: int) -> str:
        contract_id = "cnt_autogen_10283fa"
        print(f"  [AutoGen Bridge] Intercepted task delegation. Creating escrow contract: {contract_id}")
        print(f"  [AutoGen Bridge] Escrow amount: ${cost_cents / 100:.2f} locked in row-level vault.")
        return contract_id

    @staticmethod
    def verify_message_content(contract_id: str, content: Dict[str, Any], schema: Dict[str, Any]) -> bool:
        print(f"  [AutoGen Bridge] Validating WorkerAgent response against schema...")
        for req in schema.get("required", []):
            if req not in content:
                print(f"  [AutoGen Bridge] Missing required field '{req}'. Rejecting.")
                return False
        print(f"  [AutoGen Bridge] Schema valid. Settling contract {contract_id} (1.5% fee collected).")
        return True


def run_autogen_simulation():
    print("=" * 76)
    print("🤖 AUTOGEN + VERISETT: VERIFIABLE MULTI-AGENT SETTLEMENT INTERCEPT")
    print("=" * 76)

    bridge = AutoGenVerisettBridge()

    # Step 1: ClientAgent requests data and specifies schema
    task_schema = {
        "required": ["market_sentiment", "confidence_score", "key_catalysts"],
        "properties": {
            "market_sentiment": {"type": "string"},
            "confidence_score": {"type": "number"},
            "key_catalysts": {"type": "array"}
        }
    }

    contract_id = bridge.intercept_proposal(
        message={"content": "Please analyze AI infrastructure market sentiment for next quarter."},
        cost_cents=75 # $0.75
    )

    # Step 2: WorkerAgent delivers output
    worker_reply = {
        "market_sentiment": "BULLISH",
        "confidence_score": 0.92,
        "key_catalysts": [
            "Increased demand for low-latency agent micro-payments",
            "Hardware cluster expansion",
            "Model Context Protocol standard adoption"
        ]
    }

    # Step 3: Verisett verifies output and clears settlement
    is_settled = bridge.verify_message_content(contract_id, worker_reply, task_schema)

    print("\n✅ AutoGen Verification Report:")
    print(f"  • Contract: {contract_id}")
    print(f"  • Settled: {is_settled}")
    print(f"  • Data Delivered:\n{json.dumps(worker_reply, indent=4)}")
    print("=" * 76)


if __name__ == "__main__":
    run_autogen_simulation()
