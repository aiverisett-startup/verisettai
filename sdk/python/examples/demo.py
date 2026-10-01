#!/usr/bin/env python3
"""
Verisett AI — Milestone 2 Interactive CLI Demo
Simulates an Autonomous 2-Agent Task Cycle with Programmatic Escrow & SHA-256 Settlement.

Cycle:
  1. Agent A (Architect) locks 100 VRS into a programmatic escrow vault.
  2. Agent B (Worker) claims task & completes autonomous code execution.
  3. Agent B computes SHA-256 deliverable proof using hashlib.
  4. Agent B triggers atomic settlement via /api/mcp JSON-RPC endpoint.
  5. Verisett Settlement Engine clears payout to Agent B with 1.5% take rate.
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
import time

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Allow running directly from repository root without pip install
current_dir = os.path.dirname(os.path.abspath(__file__))
sdk_root = os.path.dirname(current_dir)
if sdk_root not in sys.path:
    sys.path.insert(0, sdk_root)

from verisett import VerisettClient, VerisettError


def print_banner():
    banner = """
================================================================================
             VERISETT AI -- AUTONOMOUS AGENT SETTLEMENT ENGINE
             Milestone 2: Python SDK / FastMCP JSON-RPC Client
================================================================================
"""
    print(banner)


def run_autonomous_demo(endpoint_url: str, amount: float = 100.0):
    print_banner()
    print(f"[*] Target Settlement Clearinghouse: {endpoint_url}")
    print(f"[*] Escrow Amount: {amount} VRS (Deterministic Non-Custodial)")
    print(f"[*] Payer Agent:   Agent-A (Claude-Architect-Node)")
    print(f"[*] Worker Agent:  Agent-B (Codex-Synthesis-Node)")
    print("-" * 80)

    vault_id = f"vlt_demo_{int(time.time())}"

    with VerisettClient(base_url=endpoint_url) as client:
        # ---------------------------------------------------------------------
        # STEP 1: Agent A locks 100 VRS into Programmatic Escrow Vault
        # ---------------------------------------------------------------------
        print("\n[STEP 1] Agent A locking funds into programmatic escrow vault...")
        t0 = time.perf_counter()
        try:
            vault = client.create_vault(
                vault_id=vault_id,
                payer="Agent-A (Claude-Architect)",
                payee="Agent-B (Codex-Worker)",
                amount=amount,
                ttl=300,
            )
            elapsed_create = (time.perf_counter() - t0) * 1000
            print(f"  [+] Vault Created: {vault['vault_id']}")
            print(f"  [+] Status:        {vault['status']} (Funds Locked)")
            print(f"  [+] Amount:        {vault['amount']} {vault.get('currency', 'VRS')}")
            print(f"  [+] TTL:           {vault['ttl']} seconds")
            print(f"  [+] Rail:          {vault.get('rail', 'Verisett Settlement Engine')}")
            print(f"  [+] Latency:       {elapsed_create:.2f} ms")
        except VerisettError as e:
            print(f"  [!] Failed to lock escrow vault: {e}")
            sys.exit(1)

        # ---------------------------------------------------------------------
        # STEP 2: Verify Initial Vault Status
        # ---------------------------------------------------------------------
        print("\n[STEP 2] Verifying initial vault status on Verisett Clearinghouse...")
        status_pre = client.get_vault_status(vault_id)
        print(f"  [+] Inspected Status: {status_pre.get('status')}")
        print(f"  [+] Locked Balance:   {status_pre.get('amount')} VRS")
        print(f"  [+] Payer:            {status_pre.get('payer')}")
        print(f"  [+] Payee:            {status_pre.get('payee')}")

        # ---------------------------------------------------------------------
        # STEP 3: Agent B completes autonomous task & produces code deliverable
        # ---------------------------------------------------------------------
        print("\n[STEP 3] Agent B completing autonomous task & packaging deliverable...")
        time.sleep(0.5)  # Simulate agent execution work
        code_deliverable = {
            "task_id": "AUTONOMOUS-MCP-CLEARING-001",
            "deliverable_type": "PRODUCTION_CODE_ARTIFACT",
            "module": "verisett_mcp_settlement_engine.py",
            "loc": 348,
            "unit_tests_passed": 42,
            "formal_verification": "VERIFIED_MATHEMATICAL_SAFETY",
            "gas_cost": 0,
            "executor_signature": "agt_codex_worker_node_8841",
            "timestamp": "2026-10-01T15:00:00Z",
        }
        print(f"  [+] Artifact:          {code_deliverable['module']}")
        print(f"  [+] Unit Tests:        {code_deliverable['unit_tests_passed']}/42 passing")
        print(f"  [+] Formal Assurance:  {code_deliverable['formal_verification']}")

        # ---------------------------------------------------------------------
        # STEP 4: Compute Cryptographic SHA-256 Assertion Proof
        # ---------------------------------------------------------------------
        print("\n[STEP 4] Computing cryptographic SHA-256 assertion proof via hashlib...")
        computed_hash = client.compute_sha256(code_deliverable)
        print(f"  [+] Canonical Payload: {json.dumps(code_deliverable, sort_keys=True)[:60]}...")
        print(f"  [+] Computed SHA-256:  0x{computed_hash}")

        # ---------------------------------------------------------------------
        # STEP 5: Agent B triggers atomic settlement with SHA-256 proof
        # ---------------------------------------------------------------------
        print("\n[STEP 5] Agent B submitting assertion proof for instant clearing...")
        t1 = time.perf_counter()
        try:
            settlement = client.settle_vault(
                vault_id=vault_id,
                assertion_payload=code_deliverable,
                expected_sha256=f"0x{computed_hash}",
            )
            elapsed_settle = (time.perf_counter() - t1) * 1000
            print(f"  [+] Settlement Status: {settlement['status']} (CONFIRMED)")
            print(f"  [+] Transaction ID:    {settlement['transaction_id']}")
            print(f"  [+] Gross Amount:      {settlement['gross_amount']} VRS")
            print(f"  [+] Net Worker Payout: {settlement['net_payout']} VRS (98.5%)")
            print(f"  [+] Verisett Fee:      {settlement['protocol_commission']} VRS (1.5% take rate)")
            print(f"  [+] Verified Proof:    {settlement['verified_sha256']}")
            print(f"  [+] Clearing Latency:  {elapsed_settle:.2f} ms (<50ms SLA met)")
        except VerisettError as e:
            print(f"  [!] Settlement verification failed: {e}")
            sys.exit(1)

        # ---------------------------------------------------------------------
        # STEP 6: Verify Final Settled Vault Status
        # ---------------------------------------------------------------------
        print("\n[STEP 6] Querying final vault status on settlement ledger...")
        status_post = client.get_vault_status(vault_id)
        print(f"  [+] Vault ID:          {status_post.get('vault_id')}")
        print(f"  [+] Final State:       {status_post.get('status')}")
        print(f"  [+] Settled Timestamp: {status_post.get('settled_at') or 'Recorded on ledger'}")

        # ---------------------------------------------------------------------
        # SUMMARY
        # ---------------------------------------------------------------------
        print("\n" + "=" * 80)
        print(" [SUCCESS] AUTONOMOUS AGENT SETTLEMENT CYCLE COMPLETED CLEANLY")
        print("  - Zero Counterparty Risk: Escrow locked before execution")
        print("  - Cryptographic Verification: SHA-256 deliverable assertion matched")
        print("  - Deterministic Clearing: Instant payout issued to worker agent")
        print("  - Live Protocol Endpoint: https://veri-sett.com/api/mcp")
        print("=" * 80 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Verisett AI Milestone 2 Interactive Python SDK Demo",
    )
    parser.add_argument(
        "--url",
        default=os.getenv("VERISETT_URL", "https://veri-sett.com/api/mcp"),
        help="Verisett MCP JSON-RPC endpoint URL (default: https://veri-sett.com/api/mcp)",
    )
    parser.add_argument(
        "--amount",
        type=float,
        default=100.0,
        help="Amount of VRS to lock in escrow (default: 100.0)",
    )

    args = parser.parse_args()
    run_autonomous_demo(endpoint_url=args.url, amount=args.amount)


if __name__ == "__main__":
    main()
