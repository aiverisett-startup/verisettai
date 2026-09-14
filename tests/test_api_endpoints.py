"""
Integration tests for FastAPI REST endpoints in Verisett AI Gateway.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Verisett" in data["service"]


@pytest.mark.asyncio
async def test_rest_api_full_escrow_flow(client: AsyncClient):
    # 1. Onboard Payer Agent
    payer_resp = await client.post(
        "/v1/accounts/create",
        json={"name": "Buyer Agent 007", "role": "payer", "initial_deposit_cents": 50000}
    )
    assert payer_resp.status_code == 201
    payer_data = payer_resp.json()
    payer_id = payer_data["id"]
    payer_api_key = payer_data["api_key"]
    assert payer_data["balance_cents"] == 50000

    # 2. Onboard Worker Agent
    worker_resp = await client.post(
        "/v1/accounts/create",
        json={"name": "LLM Researcher Bot", "role": "worker", "initial_deposit_cents": 0}
    )
    assert worker_resp.status_code == 201
    worker_data = worker_resp.json()
    worker_id = worker_data["id"]
    worker_api_key = worker_data["api_key"]

    # 3. Create Contract Escrow via Bearer Auth
    contract_payload = {
        "amount_cents": 20000,  # $200.00
        "assertion_type": "JSON_SCHEMA",
        "assertion_payload": {
            "schema": {
                "type": "object",
                "properties": {
                    "report": {"type": "string"},
                    "score": {"type": "number"}
                },
                "required": ["report", "score"]
            }
        },
        "timeout_seconds": 300
    }
    create_resp = await client.post(
        "/v1/contracts/create",
        json=contract_payload,
        headers={"Authorization": f"Bearer {payer_api_key}"}
    )
    assert create_resp.status_code == 201
    contract = create_resp.json()
    contract_id = contract["id"]
    assert contract["status"] == "FUNDED"
    assert contract["payer_id"] == payer_id
    assert contract["fee_cents"] == 300  # 1.5% of 20000

    # 4. Worker Claims Contract
    claim_resp = await client.post(
        f"/v1/contracts/{contract_id}/claim",
        headers={"Authorization": f"Bearer {worker_api_key}"}
    )
    assert claim_resp.status_code == 200
    claimed = claim_resp.json()
    assert claimed["status"] == "CLAIMED"
    assert claimed["worker_id"] == worker_id

    # 5. Worker Submits Valid Task Proof
    submission_payload = {
        "output_payload": {
            "report": "Comprehensive market intelligence report completed.",
            "score": 0.96
        }
    }
    submit_resp = await client.post(
        f"/v1/contracts/{contract_id}/submit",
        json=submission_payload,
        headers={"Authorization": f"Bearer {worker_api_key}"}
    )
    assert submit_resp.status_code == 200
    settled = submit_resp.json()
    assert settled["status"] == "SETTLED"
    assert settled["settled_at"] is not None

    # 6. Check Contract Status and Ledger Audit Trail
    status_resp = await client.get(f"/v1/contracts/{contract_id}/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["contract"]["status"] == "SETTLED"
    assert len(status_data["ledger_entries"]) >= 3

    # 7. Check Worker Account balance via /me
    worker_me = await client.get(
        "/v1/accounts/me",
        headers={"Authorization": f"Bearer {worker_api_key}"}
    )
    assert worker_me.status_code == 200
    # Net received: 20000 - 300 = 19700 cents
    assert worker_me.json()["balance_cents"] == 19700


@pytest.mark.asyncio
async def test_create_contract_insufficient_funds(client: AsyncClient):
    payer_resp = await client.post(
        "/v1/accounts/create",
        json={"name": "Low Balance Payer", "role": "payer", "initial_deposit_cents": 1000}
    )
    api_key = payer_resp.json()["api_key"]

    create_resp = await client.post(
        "/v1/contracts/create",
        json={
            "amount_cents": 50000,
            "assertion_type": "REGEX",
            "assertion_payload": {"pattern": "OK"},
        },
        headers={"Authorization": f"Bearer {api_key}"}
    )
    assert create_resp.status_code == 402
    err = create_resp.json()
    assert err["error"] == "INSUFFICIENT_FUNDS"


@pytest.mark.asyncio
async def test_self_claim_forbidden(client: AsyncClient):
    agent_resp = await client.post(
        "/v1/accounts/create",
        json={"name": "Solo Agent", "role": "dual", "initial_deposit_cents": 20000}
    )
    api_key = agent_resp.json()["api_key"]

    create_resp = await client.post(
        "/v1/contracts/create",
        json={
            "amount_cents": 5000,
            "assertion_type": "REGEX",
            "assertion_payload": {"pattern": "OK"},
        },
        headers={"Authorization": f"Bearer {api_key}"}
    )
    contract_id = create_resp.json()["id"]

    claim_resp = await client.post(
        f"/v1/contracts/{contract_id}/claim",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    assert claim_resp.status_code == 403
    assert claim_resp.json()["error"] == "SELF_CLAIM_FORBIDDEN"


@pytest.mark.asyncio
async def test_submit_invalid_assertion(client: AsyncClient):
    # Setup Payer and Worker
    payer_resp = await client.post(
        "/v1/accounts/create",
        json={"name": "Strict Payer", "initial_deposit_cents": 20000}
    )
    payer_key = payer_resp.json()["api_key"]

    worker_resp = await client.post(
        "/v1/accounts/create",
        json={"name": "Failing Worker"}
    )
    worker_key = worker_resp.json()["api_key"]

    create_resp = await client.post(
        "/v1/contracts/create",
        json={
            "amount_cents": 10000,
            "assertion_type": "HASH_MATCH",
            "assertion_payload": {
                "expected_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "algorithm": "sha256"
            },
        },
        headers={"Authorization": f"Bearer {payer_key}"}
    )
    contract_id = create_resp.json()["id"]

    # Claim
    await client.post(
        f"/v1/contracts/{contract_id}/claim",
        headers={"Authorization": f"Bearer {worker_key}"}
    )

    # Submit bad output
    submit_resp = await client.post(
        f"/v1/contracts/{contract_id}/submit",
        json={"output_payload": {"data": "bad content"}},
        headers={"Authorization": f"Bearer {worker_key}"}
    )
    assert submit_resp.status_code == 422
    assert submit_resp.json()["error"] == "ASSERTION_FAILED"

    # Status should be DISPUTED
    status_resp = await client.get(f"/v1/contracts/{contract_id}/status")
    assert status_resp.json()["contract"]["status"] == "DISPUTED"


@pytest.mark.asyncio
async def test_expiry_worker_sweep(client: AsyncClient, db_session):
    from datetime import datetime, timezone, timedelta
    from sqlalchemy import select
    from verisett.models.contract import Contract
    from verisett.services.expiry_worker import expiry_worker

    payer_resp = await client.post(
        "/v1/accounts/create",
        json={"name": "Payer Swept", "initial_deposit_cents": 15000}
    )
    payer_key = payer_resp.json()["api_key"]
    worker_resp = await client.post(
        "/v1/accounts/create",
        json={"name": "Slow Swept Worker"}
    )
    worker_key = worker_resp.json()["api_key"]

    create_resp = await client.post(
        "/v1/contracts/create",
        json={
            "amount_cents": 10000,
            "assertion_type": "REGEX",
            "assertion_payload": {"pattern": "DONE"},
            "timeout_seconds": 1,
        },
        headers={"Authorization": f"Bearer {payer_key}"}
    )
    contract_id = create_resp.json()["id"]

    await client.post(
        f"/v1/contracts/{contract_id}/claim",
        headers={"Authorization": f"Bearer {worker_key}"}
    )

    # Manually backdate expiration in DB session to simulate TTL expiration
    stmt = select(Contract).where(Contract.id == contract_id)
    res = await db_session.execute(stmt)
    contract = res.scalar_one()
    contract.expires_at = datetime.now(timezone.utc) - timedelta(seconds=10)
    await db_session.commit()

    # Trigger background worker sweep
    refunded_ids = await expiry_worker.run_sweep_once()
    assert contract_id in refunded_ids

    # Verify status is REFUNDED
    status_resp = await client.get(f"/v1/contracts/{contract_id}/status")
    assert status_resp.json()["contract"]["status"] == "REFUNDED"

    # Payer balance should be restored to 15000
    payer_me = await client.get("/v1/accounts/me", headers={"Authorization": f"Bearer {payer_key}"})
    assert payer_me.json()["balance_cents"] == 15000
    assert payer_me.json()["frozen_cents"] == 0

