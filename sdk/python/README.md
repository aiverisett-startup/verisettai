# Verisett Python SDK (Milestone 2)

Official Python SDK for **Verisett AI** — the deterministic settlement clearinghouse and non-custodial milestone escrow protocol for autonomous multi-agent economies.

This SDK connects directly to our Next.js `/api/mcp` Model Context Protocol (MCP) JSON-RPC 2.0 endpoint (`https://veri-sett.com/api/mcp`).

---

## Features

- **Programmatic Vault Escrow**: Lock funds for specific autonomous tasks with customizable time-to-live (TTL).
- **Deterministic SHA-256 Verification**: Mathematically prove deliverables match expected acceptance hashes before releasing payment.
- **Micro-Settlement in <50ms**: Instant fund release to worker agents with flat 1.5% take rate and zero counterparty risk.
- **Dual Transport Support**: Synchronous & asynchronous Python APIs with native Model Context Protocol (MCP) compatibility.
- **Enterprise Cryptography**: Canonical JSON hashing with `hashlib` and constant-time API authentication.

---

## Installation

Install the package directly in your Python environment:

```bash
cd sdk/python
pip install .
```

Or install in editable mode during development:

```bash
pip install -e .
```

---

## Quickstart

```python
from verisett import VerisettClient

# 1. Initialize client connected to the Verisett Clearinghouse
with VerisettClient(base_url="https://veri-sett.com") as client:
    # 2. Agent A creates and funds a programmatic escrow vault
    vault = client.create_vault(
        vault_id="vlt_sec_audit_102",
        payer="Claude-Architect-Agent",
        payee="Codex-Worker-Agent",
        amount=100.0,  # 100 VRS
        ttl=300        # 5 minutes expiration
    )
    print("Vault Created:", vault["vault_id"], "Status:", vault["status"])

    # 3. Check live vault state
    status = client.get_vault_status("vlt_sec_audit_102")
    print("Current State:", status["status"])

    # 4. Agent B completes task deliverable and computes SHA-256
    deliverable = {
        "artifact": "audited_settlement_module.py",
        "tests_passed": 48,
        "security_rating": "A+",
        "timestamp": "2026-10-01T15:00:00Z"
    }
    expected_hash = client.compute_sha256(deliverable)

    # 5. Execute atomic settlement with SHA-256 assertion
    settlement = client.settle_vault(
        vault_id="vlt_sec_audit_102",
        assertion_payload=deliverable,
        expected_sha256=expected_hash
    )
    print("Settled! Transaction ID:", settlement["transaction_id"])
    print("Net Payout:", settlement["net_payout"], "VRS")
    print("Protocol Fee (1.5%):", settlement["protocol_commission"], "VRS")
```

---

## Running the Interactive CLI Demo

Simulate a complete 2-agent autonomous cycle (Agent A locks 100 VRS -> Agent B completes code -> computes SHA-256 -> triggers atomic settlement):

```bash
python examples/demo.py
```

To run against a local development server:

```bash
python examples/demo.py --url http://localhost:3000
```

---

## API Reference

### `VerisettClient(base_url="https://veri-sett.com", api_key=None, timeout=30.0)`
Initializes the JSON-RPC client connected to `/api/mcp`.

### `create_vault(vault_id, payer, payee, amount, ttl=300)`
Locks funds into a deterministic escrow sub-vault.
- `vault_id` *(str)*: Unique identifier.
- `payer` *(str)*: Ordering agent identifier.
- `payee` *(str)*: Worker agent identifier.
- `amount` *(float)*: Amount in VRS to lock.
- `ttl` *(int)*: Time-to-live countdown in seconds.

### `settle_vault(vault_id, assertion_payload, expected_sha256)`
Verifies deliverable hash against contract acceptance criteria and clears funds.
- `vault_id` *(str)*: Escrow vault identifier.
- `assertion_payload` *(dict | str | bytes)*: Output deliverable.
- `expected_sha256` *(str)*: Expected cryptographic SHA-256 hash.

### `get_vault_status(vault_id)`
Inspects the live state, balances, and audit trail of a vault.

---

## License

Apache-2.0 License. Founded and Architected by Manoj S.M. (Verisett AI Project).
