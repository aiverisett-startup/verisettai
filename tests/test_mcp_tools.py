"""
Tests for FastMCP Gateway Server tools.
"""

import pytest
from verisett.core.database import async_session_factory
from verisett.services.account_service import AccountService
from verisett.mcp.server import (
    create_contract_escrow,
    claim_task,
    submit_task_proof,
    get_contract_status,
    check_account_balance,
)


@pytest.mark.asyncio
async def test_mcp_tools_flow(db_session):
    # Setup accounts
    payer, payer_key = await AccountService.create_account(
        db_session, name="MCP Payer", initial_deposit_cents=50000
    )
    worker, worker_key = await AccountService.create_account(
        db_session, name="MCP Worker"
    )
    await db_session.commit()

    # 1. Test check_account_balance tool
    balance_info = await check_account_balance(payer_key)
    assert balance_info["balance_cents"] == 50000
    assert balance_info["frozen_cents"] == 0

    # 2. Test create_contract_escrow tool
    created_contract = await create_contract_escrow(
        payer_api_key=payer_key,
        amount_cents=10000,
        assertion_type="REGEX",
        assertion_payload={"pattern": r"SUCCESS"},
        timeout_seconds=300,
    )
    assert created_contract["success"] is True
    assert created_contract["status"] == "FUNDED"
    assert created_contract["fee_cents"] == 150
    contract_id = created_contract["contract_id"]

    # 3. Test claim_task tool
    claimed = await claim_task(worker_api_key=worker_key, contract_id=contract_id)
    assert claimed["success"] is True
    assert claimed["status"] == "CLAIMED"
    assert claimed["worker_id"] == worker.id

    # 4. Test submit_task_proof tool
    settlement = await submit_task_proof(
        worker_api_key=worker_key,
        contract_id=contract_id,
        output_payload={"result": "TASK SUCCESS COMPLETED"},
    )
    assert settlement["success"] is True
    assert settlement["status"] == "SETTLED"
    assert settlement["amount_settled_cents"] == 9850
    assert settlement["platform_fee_cents"] == 150
    assert settlement["verification"]["passed"] is True

    # 5. Test get_contract_status tool
    status_summary = await get_contract_status(contract_id)
    assert status_summary["status"] == "SETTLED"
    assert len(status_summary["ledger_entries"]) >= 3
