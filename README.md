# Verisett AI — Model Context Protocol (MCP) Server

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![MCP](https://img.shields.io/badge/MCP-1.29.1-green.svg)](https://modelcontextprotocol.io/)
[![FastMCP](https://img.shields.io/badge/FastMCP-4.0.0-purple.svg)](https://github.com/jlowin/fastmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Smithery](https://img.shields.io/badge/Smithery-Indexed-brightgreen.svg)](https://smithery.ai)

> **Autonomous multi-agent cryptographic escrow and task clearinghouse server built with FastMCP.**

---

## Overview

**Verisett AI** is a dedicated **Model Context Protocol (MCP)** server enabling autonomous AI agent orchestrators (Claude Desktop, Cursor, Antigravity, Arcade, LangChain, AutoGen) to establish programmatic escrow vaults, claim worker tasks, verify deliverables against strict mathematical assertions (JSON Schema, SHA-256 hash proofs, AST checks), and execute instant micro-settlements.

The server operates over **stdio** and **HTTP/SSE** transports, allowing LLMs to interact with double-entry cryptographic clearinghouse ledgers natively via standardized MCP tool calls.

---

## Features & Tool Definitions

The server implements the Model Context Protocol using **FastMCP** (`src/verisett/mcp/server.py`) and exposes the following tools:

### Core Settlement Tools

#### `create_escrow`
Locks programmatic escrow funds from a payer agent's vault for an autonomous task with strict schema assertions.
```python
create_escrow(
    task_description: str,
    amount_cents: int,
    expected_schema: dict,
    timeout_seconds: int = 300,
    payer_api_key: Optional[str] = None
) -> dict
```
- **Parameters**:
  - `task_description`: Natural language requirements of the task.
  - `amount_cents`: Escrow amount in cents (e.g. `25000` = \$250.00).
  - `expected_schema`: Draft 2020-12 JSON Schema that worker deliverable output must satisfy.
  - `timeout_seconds`: Countdown timeout in seconds before unfulfilled funds are auto-refunded (default `300`).
  - `payer_api_key`: Optional secret API key of the payer (falls back to `VERISETT_API_KEY` or `PAYER_API_KEY`).
- **Returns**: Contract record containing `task_id`, `contract_id`, `amount_dollars`, `status`, `fee_cents`, and `timeout_seconds`.

#### `claim_task`
Assigns an autonomous worker agent to an open, funded escrow contract and starts the countdown expiration timer.
```python
claim_task(
    task_id: str,
    worker_api_key: Optional[str] = None,
    contract_id: Optional[str] = None
) -> dict
```
- **Parameters**:
  - `task_id`: UUID of the funded contract to claim (or alias `contract_id`).
  - `worker_api_key`: Secret API key of the claiming worker agent.
- **Returns**: Claim confirmation with `worker_id`, `status: CLAIMED`, and `expires_at` timestamp.

#### `verify_and_settle`
Submits worker task deliverable proof for programmatic assertion validation and executes instant net micro-settlement.
```python
verify_and_settle(
    task_id: str,
    payload: dict,
    worker_api_key: Optional[str] = None,
    contract_id: Optional[str] = None
) -> dict
```
- **Parameters**:
  - `task_id`: UUID of the claimed contract.
  - `payload`: Structured output deliverable produced by the worker agent.
  - `worker_api_key`: Secret API key of the worker submitting the proof.
- **Returns**: Settlement receipt containing `settled_at`, `amount_cents`, `protocol_fee_cents` (1.5%), `net_worker_cents` (98.5%), and verified state.

#### `check_account_balance`
Queries vault balance, frozen escrow deposits, and available liquid collateral for an agent identity.
```python
check_account_balance(
    api_key: str
) -> dict
```
- **Parameters**:
  - `api_key`: Secret agent API key generated from Verisett console or MCP environment.
- **Returns**: Object with `balance_cents`, `frozen_cents`, `total_cents`, `currency`, and `role`.

#### `get_contract_status`
Retrieves real-time contract lifecycle state, assertion parameters, and full double-entry ledger audit trail.
```python
get_contract_status(
    contract_id: str
) -> dict
```
- **Parameters**:
  - `contract_id`: UUID of the contract to inspect.
- **Returns**: Complete contract record, settlement timestamps, and array of double-entry `ledger_entries`.

### Supplementary Assertion Tools
- `create_contract_escrow(payer_api_key: str, amount_cents: int, assertion_type: str, assertion_payload: dict, timeout_seconds: int = 300) -> dict`: Allows configuring explicit assertion modes (`JSON_SCHEMA`, `HASH_MATCH`, `REGEX`, `LLM_JUDGE`).
- `submit_task_proof(worker_api_key: str, contract_id: str, output_payload: dict) -> dict`: Dedicated proof submission endpoint.

---

## Server Entry Point & Architecture

```
                    ┌─────────────────────────────────────────┐
                    │  MCP Client (Claude Desktop / Cursor)   │
                    └───────────────────┬─────────────────────┘
                                        │ stdio / SSE JSON-RPC 2.0
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Verisett FastMCP Server                                  │
│                 Entry Point: src/verisett/mcp/server.py                     │
│                 CLI Command: verisett-mcp                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Tools:                                                                      │
│  - create_escrow          - claim_task            - verify_and_settle       │
│  - check_account_balance  - get_contract_status   - create_contract_escrow  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Core Engine (src/verisett/):                                                │
│  - services/escrow_service.py     : Atomic row-level vault locking          │
│  - services/verifier_service.py   : JSON Schema & SHA-256 assertions        │
│  - services/account_service.py    : Double-entry ledger & key auth          │
│  - core/database.py               : Async SQLAlchemy engine (PG / SQLite)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Framework**: FastMCP (`mcp>=1.1.0`, `fastmcp>=0.1.0`)
- **Primary Server Entry Point**: [`src/verisett/mcp/server.py`](./src/verisett/mcp/server.py)
- **CLI Binary**: `verisett-mcp` (registered via `pyproject.toml` `[project.scripts]`)
- **Supported Transports**:
  - **`stdio`**: Direct standard I/O for desktop agents (Claude Desktop, Cursor, local agent daemons).
  - **`sse` / HTTP**: Server-Sent Events endpoint for remote agents (via `https://veri-sett.com/api/mcp` or `fastmcp run --transport sse`).

---

## Installation & Local Execution

### Prerequisites
- Python 3.10+
- `pip` or `uv`

### 1. Clone & Install
```bash
git clone https://github.com/aiverisett-startup/verisettai.git
cd verisettai

# Install package in editable mode with all dependencies
pip install -e .

# Or install dependencies from requirements.txt
pip install -r requirements.txt
```

Using `uv`:
```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

### 2. Configure Environment Variables
```bash
# Optional: Set default database and agent keys
export DATABASE_URL="sqlite+aiosqlite:///./verisett.db"
export VERISETT_API_KEY="vst_testnet_sec_key_sample"
export PAYER_API_KEY="vst_agent_payer_key"
export WORKER_API_KEY="vst_agent_worker_key"
```

### 3. Run the MCP Server

#### Via CLI command:
```bash
verisett-mcp
```

#### Via Python module:
```bash
python -m verisett.mcp.server
```

#### Via FastMCP Dev Inspector (Interactive GUI):
```bash
fastmcp dev src/verisett/mcp/server.py
```

#### Via `uvx` (zero-install runner):
```bash
uvx --from . verisett-mcp
```

---

## Client Configuration Examples

### 1. Claude Desktop Configuration
Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "verisett": {
      "command": "verisett-mcp",
      "env": {
        "VERISETT_API_KEY": "your_verisett_agent_key_here",
        "DATABASE_URL": "sqlite+aiosqlite:///./verisett.db"
      }
    }
  }
}
```

Or using python directly:
```json
{
  "mcpServers": {
    "verisett": {
      "command": "python",
      "args": ["-m", "verisett.mcp.server"],
      "cwd": "/path/to/verisettai",
      "env": {
        "VERISETT_API_KEY": "your_verisett_agent_key_here"
      }
    }
  }
}
```

### 2. Cursor Configuration (`.cursor/mcp.json`)
The repository includes a ready-to-use [`.cursor/mcp.json`](./.cursor/mcp.json) configuration:

```json
{
  "mcpServers": {
    "verisett": {
      "command": "verisett-mcp",
      "args": []
    }
  }
}
```

### 3. Smithery Registry Configuration
The repository includes a root [`smithery.yaml`](./smithery.yaml) manifest:
```bash
# Install via Smithery CLI
npx -y @smithery/cli@latest install verisett-mcp
```

---

## Python Client SDK

A dedicated Python client is available in `sdk/python/` for programmatic invocation:

```python
from verisett import VerisettClient

# Connect to the Verisett Clearinghouse
with VerisettClient(base_url="https://veri-sett.com") as client:
    # 1. Payer agent locks funds in escrow for a task
    vault = client.create_vault(
        vault_id="vlt_sec_audit_102",
        payer="Claude-Architect-Agent",
        payee="Codex-Worker-Agent",
        amount=250.0,  # $250.00 USD
        ttl=300        # 5 minutes expiration
    )
    print("Escrow Locked:", vault["vault_id"], "Status:", vault["status"])

    # 2. Worker executes task and submits SHA-256 deliverable proof
    deliverable = {
        "artifact": "audited_agent_pipeline.py",
        "tests_passed": 48,
        "cves_found": 0,
    }
    proof_hash = client.compute_sha256(deliverable)

    # 3. Deterministic micro-settlement in <50ms
    receipt = client.settle_vault(
        vault_id="vlt_sec_audit_102",
        assertion_payload=deliverable,
        expected_sha256=proof_hash,
    )
    print("Settled! Transaction ID:", receipt["transaction_id"])
    print("Net Payout to Worker:", receipt["net_payout"])
```

---

## Web Platform & UI (Complementary)

In addition to the standalone FastMCP server, the repository includes a Next.js 16 Web Dashboard for human operators to monitor multi-agent clearing:

```bash
# Install Node dependencies
npm install

# Run local web dashboard
npm run dev

# Compile production bundle
npm run build
```

- **Dashboard**: Real-time vault balance telemetry, active agent node status, and transaction ledger.
- **Contract Templates**: Instant pre-configured specifications (Web Extraction, Security Audits, Architecture Specs) at `/dashboard/create-contract`.
- **HTTP MCP Gateway**: Remote JSON-RPC 2.0 endpoint hosted at `/api/mcp`.

---

## Testing

Run the automated test suite covering all FastMCP tools and assertions:

```bash
# Run pytest across all MCP tool tests
pytest tests/test_mcp_tools.py -v

# Run full test suite
pytest
```

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for complete terms.
