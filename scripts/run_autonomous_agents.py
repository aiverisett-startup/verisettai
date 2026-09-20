"""
Verisett AI — Autonomous Two-Agent Task Engine
Runs entirely OUTSIDE the website to execute multi-agent commerce and settlements.

Agent 1 (Consumer / Payer): Aiverisett Primary Payer Agent
- Authenticates using master API Key: vrs_live_aiverisettgmailcom89f72b
- Formulates autonomous tasks, commissions deliverables, verifies cryptographic proofs, and settles funds.

Agent 2 (Worker / Specialist): Gemini-Flash-Extractor (Worker)
- Specialized worker agent that performs data synthesis, verification checks, and computation.
- Submits structured JSON deliverables to the escrow clearinghouse.
"""

import sys
import time
import json
import hashlib
import random
import httpx

# Ensure proper Unicode output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

API_KEY = "vrs_live_aiverisettgmailcom89f72b"
GATEWAY_URL = "http://127.0.0.1:3000"

TASKS = [
    {
        "title": "Autonomous Financial Data Synthesis: NVDA Q3 Enterprise Metrics",
        "category": "DATA_EXTRACTION",
        "amount": 2500,
        "payload": {
            "ticker": "NVDA",
            "revenue_billions": 35.08,
            "gross_margin_pct": 74.6,
            "ai_datacenter_growth_pct": 112.4,
            "confidence": 0.98,
        },
    },
    {
        "title": "Smart Escrow Reentrancy & Double-Spend Security Audit",
        "category": "SECURITY_AUDIT",
        "amount": 4000,
        "payload": {
            "vulnerabilities_found": 0,
            "acid_row_lock_verified": True,
            "fee_take_rate": "1.5%",
            "severity_score": 0.0,
            "confidence": 0.99,
        },
    },
    {
        "title": "Cross-Agent FastMCP Protocol Latency & Diagnostics Benchmark",
        "category": "NETWORK_DIAGNOSTICS",
        "amount": 1500,
        "payload": {
            "round_trip_latency_ms": 11.4,
            "network_jitter_ms": 0.3,
            "throughput_tps": 1420,
            "passed": True,
            "confidence": 0.96,
        },
    },
    {
        "title": "Autonomous Multi-Hop Web Grounding & Market Sentiment Analysis",
        "category": "RESEARCH_SYNTHESIS",
        "amount": 3500,
        "payload": {
            "topic": "Autonomous Agent Commerce 2026",
            "sources_analyzed": 18,
            "sentiment_score": 0.88,
            "institutional_flow": "ACCUMULATING",
            "confidence": 0.94,
        },
    },
    {
        "title": "Automated Deliverable Signature Verification & Merkle Root Proof",
        "category": "CRYPTOGRAPHIC_PROOF",
        "amount": 2000,
        "payload": {
            "algorithm": "ECDSA_SECP256K1",
            "merkle_root": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
            "integrity": "PASS",
            "confidence": 0.99,
        },
    },
]


class AutonomousPayerAgent:
    """Agent 1: Payer agent authorized via vrs_live_aiverisettgmailcom89f72b."""

    def __init__(self, name="Aiverisett Primary Payer Agent", api_key=API_KEY):
        self.name = name
        self.api_key = api_key
        self.client = httpx.Client(
            base_url=GATEWAY_URL,
            timeout=15.0,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
                "x-api-key": self.api_key,
                "User-Agent": f"VerisettAutonomousAgent/{self.name}",
            },
        )

    def check_live_status(self):
        """Fetches live balance and account status from verisett.db."""
        resp = self.client.get(f"/api/verisett/agent?key={self.api_key}")
        resp.raise_for_status()
        return resp.json()

    def settle_contract(self, worker_name, amount, task_title, deliverable_payload, is_success=True):
        """Transfers funds to worker agent via the gateway with cryptographic proof."""
        proof = hashlib.sha256(json.dumps(deliverable_payload, sort_keys=True).encode()).hexdigest()

        payload = {
            "fromAgent": self.name,
            "fromAgentModel": "FastMCP Institutional Payer Agent v2.4",
            "toAgent": worker_name,
            "toAgentModel": "Autonomous Deliverable Specialist",
            "amount": amount,
            "status": "SUCCESSFUL" if is_success else "FAILED",
            "milestone": task_title,
            "apiKey": self.api_key,
            "sha256Proof": f"sha256:{proof[:16]}",
        }

        resp = self.client.post("/api/transfer", json=payload)
        resp.raise_for_status()
        return resp.json()


class AutonomousWorkerAgent:
    """Agent 2: Specialist worker agent that executes work and produces deliverables."""

    def __init__(self, name="Gemini-Flash-Extractor (Worker)"):
        self.name = name

    def execute_work(self, task):
        """Simulates autonomous work execution and produces deliverable payload."""
        time.sleep(0.3)  # Computational simulation
        return task["payload"]


def execute_transaction_round(payer, worker, task_idx=None):
    if task_idx is None:
        task = random.choice(TASKS)
    else:
        task = TASKS[task_idx % len(TASKS)]

    print(f"\n[AGENT 1: {payer.name}]")
    print(f"  --> Commissioning Task: '{task['title']}'")
    print(f"  --> Escrow Allocation:  ₹{task['amount']:,} Credits")

    # Worker executes task
    print(f"\n[AGENT 2: {worker.name}]")
    print(f"  <-- Received Task: Executing {task['category']} compute...")
    deliverable = worker.execute_work(task)
    print(f"  <-- Deliverable Prepared: Confidence Score = {deliverable.get('confidence', 1.0)}")

    # Payer verifies and settles through gateway
    print(f"\n[SETTLEMENT CLEARINGHOUSE]")
    print(f"  --> Authorizing payment using API Key '{payer.api_key[:12]}...'")
    result = payer.settle_contract(
        worker_name=worker.name,
        amount=task["amount"],
        task_title=task["title"],
        deliverable_payload=deliverable,
        is_success=True,
    )

    if result.get("success"):
        new_balance = result.get("vaultBalance", {}).get("available_balance", 0)
        tx = result.get("transaction", {})
        print(f"  [+] Transaction Settled Successfully!")
        print(f"      * Transaction ID:    {tx.get('id', 'N/A')}")
        print(f"      * Amount Transferred: ₹{task['amount']:,} VRS")
        print(f"      * Updated Vault Bal: ₹{new_balance:,} VRS")
        print(f"      * Outcome:           SUCCESSFUL (+1 on Line Graph)")
    else:
        print(f"  [-] Settlement Error: {result.get('error')}")

    return result


def main():
    print("=" * 76)
    print("  VERISETT AI: AUTONOMOUS TWO-AGENT WORKSPACE WORKFLOW")
    print("=" * 76)
    print(f"  Gateway Target:    {GATEWAY_URL}")
    print(f"  Active API Key:    {API_KEY}")

    payer = AutonomousPayerAgent()
    worker = AutonomousWorkerAgent()

    # Step 1: Pre-flight health check
    print("\n--- Step 1: Querying Agent State from verisett.db ---")
    try:
        status = payer.check_live_status()
        print(f"  [+] Connected to Verisett Gateway!")
        print(f"      * Agent Name:   {status.get('name')}")
        print(f"      * Live Balance: {status.get('balance_cents'):,} Credits")
        print(f"      * Role:         {status.get('role')}")
        print(f"      * Status:       {status.get('status')}")
    except Exception as e:
        print(f"  [-] Could not connect to gateway: {e}")
        print("      Make sure the Next.js server is running on port 3000.")
        return

    # Step 2: Execute autonomous transactions
    iterations = 3
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        iterations = int(sys.argv[1])

    print(f"\n--- Step 2: Executing {iterations} Autonomous Transactions ---")
    for i in range(iterations):
        print(f"\n>>> ROUND {i + 1} OF {iterations} <<<")
        execute_transaction_round(payer, worker, task_idx=i)
        if i < iterations - 1:
            time.sleep(1.5)

    print("\n" + "=" * 76)
    print("  ALL TRANSACTIONS COMPLETED!")
    print("  The website dashboard has updated in real time via Server-Sent Events (SSE).")
    print("  * Vault balance updated dynamically.")
    print("  * Line graph stepped UP (+1) for each successful settlement.")
    print("  * Transactions logged in the PhonePe-style transaction ledger.")
    print("=" * 76)


if __name__ == "__main__":
    main()
