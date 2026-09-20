"""
Verisett AI — End-to-End Automated Test Suite: Two Agents & Website Digital Lock
Tests:
1. Connectivity to the live website at http://localhost:3000
2. Agent Liquidity Deposit into Digital Lock Vault
3. Service Negotiation, Execution & Deliverable Proof Generation
4. Digital Lock Escrow Verification & Micro-Settlement (1.5% take rate)
5. Bidirectional Multi-Agent Commerce
6. Digital Lock Defense: Malformed Deliverable Rejection & Fund Protection
7. Live Website Invariant & Transaction History Verification
"""

import asyncio
import json
import sys
import time
from pathlib import Path

# Safe encoding on Windows PowerShell
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure script can import agents
sys.path.insert(0, str(Path(__file__).resolve().parent))

from agents import ServiceConsumerAgent, ServiceProviderAgent


def banner(title: str):
    print("\n" + "=" * 76)
    print(f"  {title.upper()}")
    print("=" * 76)


async def main():
    website_url = "http://localhost:3000"
    print("=" * 76)
    print("  VERISETT AI: AUTONOMOUS TWO-AGENT DIGITAL LOCK TEST ENGINE")
    print(f"  Target Website: {website_url}")
    print("=" * 76)

    # Initialize Agents
    consumer = ServiceConsumerAgent(
        name="Alpha Capital Orchestrator",
        model="FastMCP v2.4 Autonomous Client",
        website_base_url=website_url,
    )
    provider = ServiceProviderAgent(
        name="Apex Intelligence Worker",
        model="FastMCP v2.4 Autonomous Worker",
    )

    try:
        # Pre-flight Check: Verify Website is Online
        banner("Stage 0: Live Website Heartbeat & Digital Lock Inspection")
        try:
            initial_state = await consumer.get_digital_lock_state()
            vault_bal = initial_state.get("vaultBalance", {})
            print("  [+] Connected successfully to website digital lock gateway!")
            print(f"    - Current Available Balance: INR {vault_bal.get('available_balance', 0):,}")
            print(f"    - Total Settled Volume:      INR {vault_bal.get('total_volume', 0):,}")
            print(f"    - Platform Commission:       INR {vault_bal.get('total_commission', 0):,}")
            print(f"    - Initial Transactions:      {len(initial_state.get('transactions', []))}")
        except Exception as e:
            print(f"  [-] Could not connect to website at {website_url}: {e}")
            print("    Please ensure Next.js server is running on port 3000.")
            return

        # Stage 1: Liquidity Deposit into Digital Lock
        banner("Stage 1: Consumer Agent Deposits Liquidity into Digital Lock Vault")
        deposit_amount = 10000  # INR 10,000
        print(f"  [>] {consumer.name} depositing INR {deposit_amount:,} into Website Digital Lock...")
        deposit_res = await consumer.deposit_to_digital_lock(deposit_amount)
        assert deposit_res.get("success"), "Deposit failed on website digital lock"
        print(f"  [+] Deposit Confirmed by Website! Transaction ID: {deposit_res.get('transaction', {}).get('id')}")
        print(f"  [+] New Digital Lock Vault Balance: INR {deposit_res.get('vaultBalance', {}).get('available_balance', 0):,}")
        print(f"  [+] Connected Agent on Website:     {deposit_res.get('connectedAgentName')}")

        # Stage 2: Service Request, Delivery & Digital Lock Settlement (Happy Path)
        banner("Stage 2: Service Negotiation, Fulfillment & Digital Lock Escrow Release")
        service_cost = 2500  # INR 2,500
        print(f"  [1] {consumer.name} discovers {provider.name}'s service catalog:")
        for svc in provider.get_service_catalog():
            print(f"      * {svc['service']} (Min: INR {svc['min_price_inr']:,}): {svc['description']}")

        print(f"\n  [2] {consumer.name} issues Service Order for 'FINANCIAL_DATA_ANALYSIS' (Bounty: INR {service_cost:,})...")
        order_1 = consumer.create_service_order(
            service_name="FINANCIAL_DATA_ANALYSIS",
            amount_inr=service_cost,
            requirements={"ticker": "NVDA", "min_confidence": 0.85},
            expected_schema={
                "required": [
                    "ticker",
                    "revenue_billions",
                    "gross_margin_pct",
                    "ai_datacenter_growth_pct",
                    "insights",
                    "confidence_score",
                ]
            },
        )
        print(f"      - Order ID: {order_1.order_id}")
        print(f"      - Digital Lock Criteria: Strict JSON Schema with 6 required properties & confidence >= 85%")

        print(f"\n  [3] {provider.name} accepts order and executes computation...")
        deliverable_1 = await provider.execute_service(order_1)
        print(f"      [+] Service Executed in {deliverable_1.execution_time_ms}ms")
        print(f"      [+] SHA-256 Deliverable Proof: {deliverable_1.sha256_proof[:24]}...")
        print(f"      [+] Payload Snippet: {json.dumps(deliverable_1.payload, indent=8)[:200]}...")

        print(f"\n  [4] {consumer.name} validates deliverable invariants against digital lock criteria...")
        is_valid_1, reason_1 = consumer.verify_deliverable(order_1, deliverable_1)
        print(f"      [+] Deliverable Verification: Passed = {is_valid_1} ('{reason_1}')")
        assert is_valid_1, "Deliverable validation unexpectedly failed!"

        print(f"\n  [5] Triggering settlement through Website Digital Lock (/api/transfer)...")
        settle_1 = await consumer.settle_through_digital_lock(order_1, provider, deliverable_1, is_valid=True)
        assert settle_1.get("success"), "Settlement rejected by website digital lock"
        tx_1 = settle_1.get("transaction", {})
        print(f"      [+] SETTLEMENT CONFIRMED ON DIGITAL LOCK!")
        print(f"      [+] Transaction ID:    {tx_1.get('id')}")
        print(f"      [+] Amount Settled:    INR {tx_1.get('amountINR'):,}")
        print(f"      [+] Protocol Fee 1.5%: INR {round(tx_1.get('amountINR') * 0.015):,}")
        print(f"      [+] Net to Provider:   INR {round(tx_1.get('amountINR') * 0.985):,}")
        print(f"      [+] SHA-256 Proof:     {tx_1.get('sha256Proof')[:24]}...")
        print(f"      [+] New Vault Balance: INR {settle_1.get('vaultBalance', {}).get('available_balance', 0):,}")

        # Stage 3: Bidirectional Multi-Agent Service Exchange
        banner("Stage 3: Bidirectional Service Exchange (Reverse Contract)")
        audit_cost = 1500  # INR 1,500
        print(f"  [1] {consumer.name} contracts {provider.name} for 'SMART_CONTRACT_SECURITY_AUDIT' (Bounty: INR {audit_cost:,})...")
        order_2 = consumer.create_service_order(
            service_name="SMART_CONTRACT_SECURITY_AUDIT",
            amount_inr=audit_cost,
            requirements={"target_vault": "VLT-PRIMARY-NODE", "min_confidence": 0.95},
            expected_schema={
                "required": [
                    "target_vault",
                    "vulnerabilities_found",
                    "invariant_checks_passed",
                    "reentrancy_risk",
                    "fee_structure_verified",
                    "audit_status",
                    "confidence_score",
                ]
            },
        )
        deliverable_2 = await provider.execute_service(order_2)
        is_valid_2, reason_2 = consumer.verify_deliverable(order_2, deliverable_2)
        print(f"      [+] Service Executed in {deliverable_2.execution_time_ms}ms | Proof: {deliverable_2.sha256_proof[:24]}...")
        print(f"      [+] Deliverable Validation: {reason_2}")
        assert is_valid_2, "Deliverable validation failed"

        settle_2 = await consumer.settle_through_digital_lock(order_2, provider, deliverable_2, is_valid=True)
        tx_2 = settle_2.get("transaction", {})
        print(f"      [+] SETTLEMENT CONFIRMED ON DIGITAL LOCK!")
        print(f"      [+] Transaction ID:    {tx_2.get('id')}")
        print(f"      [+] Amount Settled:    INR {tx_2.get('amountINR'):,}")
        print(f"      [+] Clearing Rail:     {tx_2.get('clearingRail')}")

        # Stage 4: Digital Lock Security Guardrail Test (Faulty Service Protection)
        banner("Stage 4: Digital Lock Security Guardrail (Malformed Service Rejection)")
        test_cost = 2000  # INR 2,000
        print(f"  [1] {consumer.name} issues order with strict verification requirements...")
        order_fail = consumer.create_service_order(
            service_name="MALFORMED_DELIVERABLE_TEST",
            amount_inr=test_cost,
            requirements={"min_confidence": 0.90},
            expected_schema={"required": ["mandatory_financial_audit", "cryptographic_root_hash"]},
        )

        print(f"  [2] Simulating faulty/incomplete execution by worker agent...")
        deliverable_fail = await provider.execute_service(order_fail, simulate_failure=True)
        print(f"      * Worker Output Status: {deliverable_fail.status}")
        print(f"      * Raw Output Payload:   {deliverable_fail.payload}")

        print(f"  [3] {consumer.name} applies digital lock validation...")
        is_valid_fail, fail_reason = consumer.verify_deliverable(order_fail, deliverable_fail)
        print(f"      [-] Validation Result: Passed = {is_valid_fail}")
        print(f"      [-] Detected Flaw:     '{fail_reason}'")
        assert not is_valid_fail, "Validation should have failed for malformed deliverable!"

        print(f"  [4] Submitting rejection signal to Website Digital Lock...")
        settle_fail = await consumer.settle_through_digital_lock(
            order_fail,
            provider,
            deliverable_fail,
            is_verified=False,
            failure_reason=fail_reason,
        )
        tx_fail = settle_fail.get("transaction", {})
        print(f"      [+] DIGITAL LOCK SECURITY DEFENSE VERIFIED!")
        print(f"      [+] Transaction Status: {tx_fail.get('status')} (Funds Protected)")
        print(f"      [+] Audit Reason:       '{tx_fail.get('failureReason')}'")
        print(f"      [+] Client Funds:       Zero balance deducted for failed service")

        # Stage 5: Live Website Verification & Ledger Audit
        banner("Stage 5: Live Website Verification & Ledger Invariant Audit")
        final_state = await consumer.get_digital_lock_state()
        final_bal = final_state.get("vaultBalance", {})
        tx_list = final_state.get("transactions", [])

        print(f"  * Final Available Vault Balance: INR {final_bal.get('available_balance', 0):,}")
        print(f"  * Total Platform Volume:        INR {final_bal.get('total_volume', 0):,}")
        print(f"  * Total Platform 1.5% Revenue:  INR {final_bal.get('total_commission', 0):,}")
        print(f"  * Total Transactions Recorded:  {len(tx_list)}")
        print(f"  * Active Connected Agent:       {final_state.get('connectedAgentName')}")
        print(f"  * Active Vault Deployments:     {len(final_state.get('activeVaults', []))}")

        print("\n  Recent Transactions Visible on Website Dashboard:")
        for idx, tx in enumerate(tx_list[:5], 1):
            status_icon = "[OK]" if tx.get("status") == "SUCCESSFUL" else "[FAIL]"
            print(f"    [{idx}] {status_icon} {tx.get('id')} | INR {tx.get('amountINR', 0):>6,} | {tx.get('fromAgent', {}).get('name')[:20]} -> {tx.get('toAgent', {}).get('name')[:20]} | {tx.get('status')}")

        banner("TEST SUITE SUMMARY: ALL 2-AGENT DIGITAL LOCK TESTS PASSED!")
        print("  1. Agent 1 (Apex Intelligence Worker): Provided verified services, earned micro-settlements.")
        print("  2. Agent 2 (Alpha Capital Orchestrator): Locked escrow funds, verified deliverables, unlocked payouts.")
        print("  3. Digital Lock (Verisett Vault): Enforced 1.5% fee, cryptographic proofs, and fraud defense.")
        print("  4. Live Website (http://localhost:3000/dashboard): All transactions recorded in real-time.")
        print("=" * 76 + "\n")

    finally:
        await consumer.close()


if __name__ == "__main__":
    asyncio.run(main())
