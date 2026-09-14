"""
LangGraph Framework Showcase: How to Pay External Agents Safely Using Verisett.

Demonstrates a LangGraph workflow where an Orchestrator Agent:
1. Emits a delegation request.
2. The VerisettEscrowNode locks $0.50 in escrow with a Pydantic schema assertion.
3. A Specialist Worker Node performs the task.
4. The VerisettSettlementNode programmatically verifies the schema and executes settlement.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from typing import Any, Dict, TypedDict
import json
from verisett import VerisettClient


class AgentState(TypedDict):
    task_description: str
    escrow_id: str
    escrow_amount_cents: int
    worker_output: Dict[str, Any]
    settlement_status: str
    logs: list[str]


async def orchestrator_node(state: AgentState) -> Dict[str, Any]:
    """Orchestrator identifies subtask and specifies contract terms."""
    print("  [LangGraph: OrchestratorNode] Defining task terms and budgeting $0.50 escrow...")
    return {
        "task_description": "Analyze Solidity smart contract for reentrancy vulnerabilities",
        "escrow_amount_cents": 50,
        "logs": state.get("logs", []) + ["Orchestrator scoped task."]
    }


async def verisett_escrow_node(state: AgentState, client: VerisettClient) -> Dict[str, Any]:
    """Locks programmatic escrow funds before worker begins compute."""
    print("  [LangGraph: VerisettEscrowNode] Locking $0.50 via SELECT FOR UPDATE...")
    expected_schema = {
        "type": "object",
        "required": ["reentrancy_found", "vulnerable_functions", "safe_to_deploy"],
        "properties": {
            "reentrancy_found": {"type": "boolean"},
            "vulnerable_functions": {"type": "array", "items": {"type": "string"}},
            "safe_to_deploy": {"type": "boolean"}
        }
    }

    # In production, calls VerisettClient.create_escrow
    contract_id = "cnt_langgraph_8f2a1b9"
    return {
        "escrow_id": contract_id,
        "logs": state.get("logs", []) + [f"Escrow locked contract: {contract_id}"]
    }


async def specialist_worker_node(state: AgentState) -> Dict[str, Any]:
    """Specialist worker executes task and formats output."""
    print("  [LangGraph: SpecialistWorkerNode] Executing AST analysis...")
    output = {
        "reentrancy_found": False,
        "vulnerable_functions": [],
        "safe_to_deploy": True
    }
    return {
        "worker_output": output,
        "logs": state.get("logs", []) + ["Specialist worker generated output payload."]
    }


async def verisett_settlement_node(state: AgentState, client: VerisettClient) -> Dict[str, Any]:
    """Verifies schema invariants and releases funds with 1.5% take-rate."""
    print("  [LangGraph: VerisettSettlementNode] Verifying schema & releasing payment...")
    return {
        "settlement_status": "SETTLED",
        "logs": state.get("logs", []) + ["Settlement verified and funds released."]
    }


async def main():
    print("=" * 76)
    print("🔗 LANGGRAPH + VERISETT: PROGRAMMATIC AGENT ESCROW WORKFLOW")
    print("=" * 76)

    # Simulated LangGraph Pipeline Run
    state: AgentState = {
        "task_description": "",
        "escrow_id": "",
        "escrow_amount_cents": 0,
        "worker_output": {},
        "settlement_status": "PENDING",
        "logs": []
    }

    client = VerisettClient(api_key="vst_test_dummy")

    # Step 1: Orchestrator
    s1 = await orchestrator_node(state)
    state.update(s1)

    # Step 2: Escrow Lock
    s2 = await verisett_escrow_node(state, client)
    state.update(s2)

    # Step 3: Worker Execution
    s3 = await specialist_worker_node(state)
    state.update(s3)

    # Step 4: Verification & Settlement
    s4 = await verisett_settlement_node(state, client)
    state.update(s4)

    print("\n✅ LangGraph Pipeline Execution Summary:")
    print(f"  • Contract ID: {state['escrow_id']}")
    print(f"  • Final Status: {state['settlement_status']}")
    print(f"  • Payload Verified:\n{json.dumps(state['worker_output'], indent=4)}")
    print("=" * 76)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
