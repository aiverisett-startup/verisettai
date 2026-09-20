"""
Verisett AI — Interactive Multi-Round Agent Console
Allows the user to trigger custom service requests or automated continuous loops
between Agent 1 (Service Provider) and Agent 2 (Service Consumer) using the website's Digital Lock.
"""

import asyncio
import sys
from pathlib import Path

# Safe encoding on Windows PowerShell
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, str(Path(__file__).resolve().parent))

from agents import ServiceConsumerAgent, ServiceProviderAgent


async def run_single_round(consumer: ServiceConsumerAgent, provider: ServiceProviderAgent, round_num: int):
    services = [
        ("FINANCIAL_DATA_ANALYSIS", 2500, {"ticker": "NVDA", "min_confidence": 0.85}),
        ("SMART_CONTRACT_SECURITY_AUDIT", 3200, {"target_vault": "VLT-PRIMARY-NODE", "min_confidence": 0.90}),
        ("DEEP_RESEARCH_SYNTHESIS", 1800, {"topic": "AI Clearinghouse Protocols", "min_confidence": 0.80}),
    ]
    svc_name, amount, reqs = services[(round_num - 1) % len(services)]

    print(f"\n[Round {round_num}] Service Contract: {svc_name} (₹{amount:,})")
    order = consumer.create_service_order(
        service_name=svc_name,
        amount_inr=amount,
        requirements=reqs,
        expected_schema={"required": ["confidence_score"]},
    )
    print(f"  [1] {consumer.name} created order {order.order_id} & locked ₹{amount:,} in Digital Lock.")

    deliverable = await provider.execute_service(order)
    print(f"  [2] {provider.name} executed service in {deliverable.execution_time_ms}ms (Proof: {deliverable.sha256_proof[:20]}...).")

    is_valid, reason = consumer.verify_deliverable(order, deliverable)
    print(f"  [3] Verification Passed: {is_valid} ({reason}).")

    settle = await consumer.settle_through_digital_lock(order, provider, deliverable, is_valid)
    tx = settle.get("transaction", {})
    fee = round(amount * 0.015)
    print(f"  [4] DIGITAL LOCK SETTLED: Tx {tx.get('id')} | Net Paid: ₹{amount - fee:,} | Fee: ₹{fee:,} (1.5%)")
    print(f"  [5] Website Vault Balance: ₹{settle.get('vaultBalance', {}).get('available_balance', 0):,}")


async def main():
    website_url = "http://localhost:3000"
    consumer = ServiceConsumerAgent(website_base_url=website_url)
    provider = ServiceProviderAgent()

    print("=" * 70)
    print("  VERISETT AI: INTERACTIVE TWO-AGENT DIGITAL LOCK CONSOLE")
    print("=" * 70)
    print(f"  Agent 1 (Service Provider): {provider.name}")
    print(f"  Agent 2 (Service Consumer): {consumer.name}")
    print(f"  Live Target Website:       {website_url}")
    print("-" * 70)

    try:
        # Deposit starting funds
        print("  Depositing initial ₹15,000 into Digital Lock Vault...")
        await consumer.deposit_to_digital_lock(15000)

        # Run 3 demonstration rounds
        for i in range(1, 4):
            await run_single_round(consumer, provider, i)
            await asyncio.sleep(1.0)

        print("\n" + "=" * 70)
        print("  [+] All interactive rounds completed successfully!")
        print("  View the live transactions on: http://localhost:3000/dashboard")
        print("=" * 70 + "\n")
    finally:
        await consumer.close()


if __name__ == "__main__":
    asyncio.run(main())
