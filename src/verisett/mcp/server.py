"""
Model Context Protocol (MCP) Server for Verisett AI Gateway.
Exposes autonomous agent escrow and micro-settlement tools natively to LLMs.
"""

import os
from typing import Any, Dict, Optional
from mcp.server.fastmcp import FastMCP

from verisett.core.constants import AssertionType
from verisett.core.database import get_session_factory, Base, async_engine
from verisett.services.account_service import AccountService
from verisett.services.escrow_service import EscrowService

mcp = FastMCP("Verisett Gateway")


async def _ensure_db_initialized():
    from verisett.core.database import async_engine
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def _resolve_api_key(passed_key: Optional[str], default_env_vars: list[str]) -> str:
    if passed_key and passed_key.strip():
        return passed_key.strip()
    for env_var in default_env_vars:
        val = os.getenv(env_var)
        if val and val.strip():
            return val.strip()
    # Fallback to general Verisett key
    fallback = os.getenv("VERISETT_API_KEY")
    if fallback:
        return fallback.strip()
    raise ValueError(
        f"API key missing. Provide it explicitly or set one of: {', '.join(default_env_vars)} or VERISETT_API_KEY"
    )


# -------------------------------------------------------------------------
# Step 1 Tools: create_escrow, claim_task, verify_and_settle
# -------------------------------------------------------------------------

@mcp.tool()
async def create_escrow(
    task_description: str,
    amount_cents: int,
    expected_schema: Dict[str, Any],
    timeout_seconds: int = 300,
    payer_api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create and fund a programmatic escrow contract for an autonomous task.
    Locks funds from the payer agent's vault using database row-level locking.

    Args:
        task_description: Plain-text description of the task requirements.
        amount_cents: Escrow amount in cents (e.g. 50 = $0.50, 5000 = $50.00).
        expected_schema: JSON Schema (Draft 2020-12) defining expected worker output structure.
        timeout_seconds: Time limit in seconds once claimed before funds automatically refund (default 300).
        payer_api_key: Optional secret API key of payer (defaults to PAYER_API_KEY or VERISETT_API_KEY env).

    Returns:
        JSON representation of the created and funded contract.
    """
    await _ensure_db_initialized()
    key = _resolve_api_key(payer_api_key, ["PAYER_API_KEY", "AGENT_A_API_KEY", "VERISETT_PAYER_KEY"])

    # Extract schema if wrapped
    schema_payload = {
        "task_description": task_description,
        "schema": expected_schema.get("schema", expected_schema),
        **{k: v for k, v in expected_schema.items() if k != "schema"}
    }

    async with get_session_factory()() as session:
        payer = await AccountService.get_by_api_key(session, key)
        contract = await EscrowService.create_and_fund_contract(
            session=session,
            payer_id=payer.id,
            amount_cents=amount_cents,
            assertion_type=AssertionType.JSON_SCHEMA,
            assertion_payload=schema_payload,
            timeout_seconds=timeout_seconds,
        )
        await session.commit()
        return {
            "success": True,
            "task_id": contract.id,
            "contract_id": contract.id,
            "payer_id": contract.payer_id,
            "amount_cents": contract.amount_cents,
            "amount_dollars": f"${(contract.amount_cents / 100):.2f}",
            "fee_cents": contract.fee_cents,
            "status": contract.status.value,
            "timeout_seconds": contract.timeout_seconds,
            "created_at": contract.created_at.isoformat(),
        }


@mcp.tool()
async def claim_task(
    task_id: Optional[str] = None,
    worker_api_key: Optional[str] = None,
    contract_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Claim an active FUNDED contract as an autonomous worker agent.
    Binds the worker to the task and initiates the countdown expiration timer.

    Args:
        task_id: UUID of the funded contract/task to claim (can also pass as contract_id).
        worker_api_key: Optional secret API key of worker (defaults to WORKER_API_KEY or AGENT_B_API_KEY).
        contract_id: Optional alias for task_id.

    Returns:
        JSON representation of the claimed task and expiry timestamp.
    """
    resolved_id = task_id or contract_id
    if not resolved_id:
        raise ValueError("Either task_id or contract_id must be provided")

    await _ensure_db_initialized()
    key = _resolve_api_key(worker_api_key, ["WORKER_API_KEY", "AGENT_B_API_KEY", "VERISETT_WORKER_KEY"])

    async with get_session_factory()() as session:
        worker = await AccountService.get_by_api_key(session, key)
        contract = await EscrowService.claim_contract(
            session=session,
            contract_id=resolved_id,
            worker_id=worker.id,
        )
        await session.commit()
        return {
            "success": True,
            "task_id": contract.id,
            "contract_id": contract.id,
            "worker_id": contract.worker_id,
            "status": contract.status.value,
            "expires_at": contract.expires_at.isoformat() if contract.expires_at else None,
        }


@mcp.tool()
async def verify_and_settle(
    task_id: Optional[str] = None,
    payload: Optional[Dict[str, Any]] = None,
    worker_api_key: Optional[str] = None,
    contract_id: Optional[str] = None,
    output_payload: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Submit task output proof for programmatic verification and instant micro-settlement.
    If valid, automatically credits net funds to worker and collects 1.5% platform take-rate.

    Args:
        task_id: UUID of the claimed contract/task (can also pass as contract_id).
        payload: Output proof data dictionary produced by the worker agent (can also pass as output_payload).
        worker_api_key: Optional secret API key of worker (defaults to WORKER_API_KEY or AGENT_B_API_KEY).

    Returns:
        Settlement and verification report including net payout and take-rate fee.
    """
    resolved_id = task_id or contract_id
    if not resolved_id:
        raise ValueError("Either task_id or contract_id must be provided")

    resolved_payload = payload if payload is not None else output_payload
    if resolved_payload is None:
        raise ValueError("Either payload or output_payload must be provided")

    await _ensure_db_initialized()
    key = _resolve_api_key(worker_api_key, ["WORKER_API_KEY", "AGENT_B_API_KEY", "VERISETT_WORKER_KEY"])

    async with get_session_factory()() as session:
        worker = await AccountService.get_by_api_key(session, key)
        contract, verification = await EscrowService.submit_and_verify(
            session=session,
            contract_id=resolved_id,
            worker_id=worker.id,
            output_payload=resolved_payload,
        )
        await session.commit()
        return {
            "success": verification.passed,
            "task_id": contract.id,
            "contract_id": contract.id,
            "status": contract.status.value,
            "worker_id": contract.worker_id,
            "amount_settled_cents": contract.amount_cents - contract.fee_cents,
            "amount_settled_dollars": f"${((contract.amount_cents - contract.fee_cents) / 100):.2f}",
            "platform_fee_cents": contract.fee_cents,
            "platform_fee_dollars": f"${(contract.fee_cents / 100):.2f}",
            "settled_at": contract.settled_at.isoformat() if contract.settled_at else None,
            "verification": {
                "passed": verification.passed,
                "reason": verification.reason,
            },
        }


# -------------------------------------------------------------------------
# Supplementary Inspection Tools
# -------------------------------------------------------------------------

@mcp.tool()
async def create_contract_escrow(
    payer_api_key: str,
    amount_cents: int,
    assertion_type: str,
    assertion_payload: Dict[str, Any],
    timeout_seconds: int = 300,
) -> Dict[str, Any]:
    """
    Create custom escrow contract with explicit assertion type ('JSON_SCHEMA', 'HASH_MATCH', 'REGEX', 'LLM_JUDGE').
    """
    await _ensure_db_initialized()
    parsed_assertion = AssertionType(assertion_type.upper())

    async with get_session_factory()() as session:
        payer = await AccountService.get_by_api_key(session, payer_api_key)
        contract = await EscrowService.create_and_fund_contract(
            session=session,
            payer_id=payer.id,
            amount_cents=amount_cents,
            assertion_type=parsed_assertion,
            assertion_payload=assertion_payload,
            timeout_seconds=timeout_seconds,
        )
        await session.commit()
        return {
            "success": True,
            "contract_id": contract.id,
            "payer_id": contract.payer_id,
            "amount_cents": contract.amount_cents,
            "fee_cents": contract.fee_cents,
            "status": contract.status.value,
            "assertion_type": contract.assertion_type.value,
            "timeout_seconds": contract.timeout_seconds,
            "created_at": contract.created_at.isoformat(),
        }


@mcp.tool()
async def submit_task_proof(
    worker_api_key: str,
    contract_id: str,
    output_payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Submit task output proof for programmatic verification (alias for verify_and_settle).
    """
    return await verify_and_settle(task_id=contract_id, payload=output_payload, worker_api_key=worker_api_key)


@mcp.tool()
async def get_contract_status(
    contract_id: str,
) -> Dict[str, Any]:
    """
    Retrieve current contract status, details, and double-entry ledger history.
    """
    await _ensure_db_initialized()
    async with get_session_factory()() as session:
        contract, entries = await EscrowService.get_contract_with_ledger(session, contract_id)
        return {
            "contract_id": contract.id,
            "payer_id": contract.payer_id,
            "worker_id": contract.worker_id,
            "amount_cents": contract.amount_cents,
            "fee_cents": contract.fee_cents,
            "status": contract.status.value,
            "assertion_type": contract.assertion_type.value,
            "expires_at": contract.expires_at.isoformat() if contract.expires_at else None,
            "settled_at": contract.settled_at.isoformat() if contract.settled_at else None,
            "ledger_entries": [
                {
                    "entry_id": e.entry_id,
                    "from_account": e.from_account,
                    "to_account": e.to_account,
                    "amount_cents": e.amount_cents,
                    "entry_type": e.entry_type.value,
                    "created_at": e.created_at.isoformat(),
                }
                for e in entries
            ],
        }


@mcp.tool()
async def check_account_balance(
    api_key: str,
) -> Dict[str, Any]:
    """
    Check available and frozen escrow balances for an agent account.
    """
    await _ensure_db_initialized()
    async with get_session_factory()() as session:
        account = await AccountService.get_by_api_key(session, api_key)
        return {
            "account_id": account.id,
            "name": account.name,
            "role": account.role.value,
            "balance_cents": account.balance_cents,
            "frozen_cents": account.frozen_cents,
            "total_cents": account.total_cents,
            "currency": account.currency,
        }


def main():
    """CLI entrypoint for verisett-mcp."""
    mcp.run()


if __name__ == "__main__":
    main()
