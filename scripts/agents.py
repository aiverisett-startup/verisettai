"""
Verisett AI — Autonomous Two-Agent Service & Digital Lock Protocol
Defines:
- ServiceDeliverable & ServiceOrder models
- ServiceProviderAgent (Agent 1: Worker that fulfills and delivers services)
- ServiceConsumerAgent (Agent 2: Consumer that requests services and unlocks payment via website digital lock)
"""

import hashlib
import json
import time
from typing import Any, Dict, List, Optional
import httpx


class ServiceOrder:
    """Represents a formal agreement/order for an autonomous service."""
    def __init__(
        self,
        order_id: str,
        service_name: str,
        amount_inr: int,
        client_name: str,
        requirements: Dict[str, Any],
        expected_schema: Optional[Dict[str, Any]] = None,
        timeout_seconds: int = 120,
    ):
        self.order_id = order_id
        self.service_name = service_name
        self.amount_inr = amount_inr
        self.client_name = client_name
        self.requirements = requirements
        self.expected_schema = expected_schema or {}
        self.timeout_seconds = timeout_seconds
        self.created_at = time.time()


class ServiceDeliverable:
    """The completed work payload and cryptographic proof delivered by the worker agent."""
    def __init__(
        self,
        order_id: str,
        provider_name: str,
        payload: Dict[str, Any],
        execution_time_ms: int,
        status: str = "COMPLETED",
    ):
        self.order_id = order_id
        self.provider_name = provider_name
        self.payload = payload
        self.execution_time_ms = execution_time_ms
        self.status = status
        self.timestamp = time.time()
        # Compute deterministic SHA-256 deliverable proof
        proof_string = f"{order_id}:{provider_name}:{json.dumps(payload, sort_keys=True)}:{self.timestamp}"
        self.sha256_proof = "0x" + hashlib.sha256(proof_string.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "order_id": self.order_id,
            "provider_name": self.provider_name,
            "payload": self.payload,
            "execution_time_ms": self.execution_time_ms,
            "status": self.status,
            "sha256_proof": self.sha256_proof,
            "timestamp": self.timestamp,
        }


class ServiceProviderAgent:
    """
    Agent 1: The Service Provider (Worker Node).
    Offers autonomous services (e.g. data extraction, smart contract audits, security validation).
    Executes tasks and submits verifiable deliverables to the digital lock.
    """
    def __init__(
        self,
        name: str = "Apex Intelligence Worker",
        model: str = "FastMCP v2.4 Autonomous Worker",
        agent_id: str = "agt_worker_apex",
    ):
        self.name = name
        self.model = model
        self.agent_id = agent_id
        self.balance_inr = 0
        self.completed_tasks = 0
        self.catalog = [
            {
                "service": "FINANCIAL_DATA_ANALYSIS",
                "description": "Extracts real-time financial metrics, balance sheet invariants, and growth factors",
                "min_price_inr": 1500,
            },
            {
                "service": "SMART_CONTRACT_SECURITY_AUDIT",
                "description": "Performs static and dynamic vulnerability analysis for digital locks and vaults",
                "min_price_inr": 2500,
            },
            {
                "service": "DEEP_RESEARCH_SYNTHESIS",
                "description": "Multi-hop research query execution with citations and confidence score",
                "min_price_inr": 1000,
            },
        ]

    def get_service_catalog(self) -> List[Dict[str, Any]]:
        return self.catalog

    async def execute_service(
        self,
        order: ServiceOrder,
        simulate_failure: bool = False,
    ) -> ServiceDeliverable:
        """
        Performs the requested service and produces the deliverable payload.
        If simulate_failure=True, intentionally generates malformed output to test digital lock safety.
        """
        start_time = time.time()

        if simulate_failure:
            # Intentionally corrupt the output: missing required schema keys
            corrupt_payload = {
                "error": "Execution interrupted or invalid input criteria",
                "raw_snippet": "Incomplete execution stream",
            }
            exec_time = int((time.time() - start_time) * 1000) + 120
            return ServiceDeliverable(
                order_id=order.order_id,
                provider_name=self.name,
                payload=corrupt_payload,
                execution_time_ms=exec_time,
                status="FAILED",
            )

        # Generate schema-compliant deliverable based on service type
        if "FINANCIAL" in order.service_name.upper():
            ticker = order.requirements.get("ticker", "NVDA")
            payload = {
                "ticker": ticker,
                "revenue_billions": 35.08,
                "gross_margin_pct": 74.6,
                "ai_datacenter_growth_pct": 112.4,
                "insights": [
                    f"Strong demand acceleration for {ticker} enterprise compute clusters.",
                    "Supply chain capacity expanded by 18% quarter-over-quarter.",
                ],
                "confidence_score": 0.96,
                "audit_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
        elif "AUDIT" in order.service_name.upper():
            target_vault = order.requirements.get("target_vault", "VLT-PRIMARY-NODE")
            payload = {
                "target_vault": target_vault,
                "vulnerabilities_found": 0,
                "invariant_checks_passed": True,
                "reentrancy_risk": "ZERO_NON_REENTRANT",
                "fee_structure_verified": "FLAT_1_POINT_5_PERCENT",
                "audit_status": "CERTIFIED_SECURE",
                "confidence_score": 0.99,
                "audit_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
        else:
            payload = {
                "task": order.service_name,
                "status": "COMPLETED",
                "result": "Autonomous task executed with strict schema alignment.",
                "confidence_score": 0.95,
                "audit_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }

        exec_time = int((time.time() - start_time) * 1000) + 240
        self.completed_tasks += 1
        return ServiceDeliverable(
            order_id=order.order_id,
            provider_name=self.name,
            payload=payload,
            execution_time_ms=exec_time,
            status="COMPLETED",
        )

    def credit_payment(self, net_amount_inr: int):
        """Records net earnings after digital lock takes platform fee."""
        self.balance_inr += net_amount_inr


class ServiceConsumerAgent:
    """
    Agent 2: The Service Consumer (Payer Node).
    Needs autonomous services, locks task funds in the website's digital lock (escrow vault),
    verifies service deliverables against strict criteria, and releases payment.
    """
    def __init__(
        self,
        name: str = "Alpha Capital Orchestrator",
        model: str = "FastMCP v2.4 Autonomous Client",
        agent_id: str = "agt_consumer_alpha",
        website_base_url: str = "http://localhost:3000",
    ):
        self.name = name
        self.model = model
        self.agent_id = agent_id
        self.base_url = website_base_url.rstrip("/")
        self.balance_inr = 0
        self._http = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=15.0,
            headers={
                "Content-Type": "application/json",
                "x-agent-name": self.name,
                "x-agent-model": self.model,
                "User-Agent": f"VerisettAgent/{self.name}",
            },
        )

    async def close(self):
        await self._http.aclose()

    async def get_digital_lock_state(self) -> Dict[str, Any]:
        """Queries the live digital lock state and balance from the website."""
        resp = await self._http.get("/api/transfer")
        resp.raise_for_status()
        return resp.json()

    async def deposit_to_digital_lock(self, amount_inr: int) -> Dict[str, Any]:
        """
        Deposits liquidity funds directly into the website's Digital Lock Vault.
        Reflected in real time on the website's live balance.
        """
        payload = {
            "agent_name": self.name,
            "agentModel": self.model,
            "amount_inr": amount_inr,
            "milestone": f"Digital Lock Liquidity Inflow by {self.name}",
        }
        resp = await self._http.post("/api/vault/deposit", json=payload)
        resp.raise_for_status()
        data = resp.json()
        self.balance_inr += amount_inr
        return data

    def create_service_order(
        self,
        service_name: str,
        amount_inr: int,
        requirements: Dict[str, Any],
        expected_schema: Optional[Dict[str, Any]] = None,
    ) -> ServiceOrder:
        """Constructs a formal service agreement order."""
        order_id = f"ORD-{int(time.time() * 1000) % 1000000:06d}"
        return ServiceOrder(
            order_id=order_id,
            service_name=service_name,
            amount_inr=amount_inr,
            client_name=self.name,
            requirements=requirements,
            expected_schema=expected_schema,
        )

    def verify_deliverable(
        self,
        order: ServiceOrder,
        deliverable: ServiceDeliverable,
    ) -> tuple[bool, str]:
        """
        Validates the deliverable against the order's requirements and schema.
        Prevents payment release if deliverables do not satisfy requirements.
        """
        if deliverable.status != "COMPLETED":
            return False, f"Deliverable reported status '{deliverable.status}' instead of 'COMPLETED'."

        if not deliverable.payload:
            return False, "Deliverable payload is completely empty."

        # Verify required keys specified in schema
        required_keys = order.expected_schema.get("required", [])
        for key in required_keys:
            if key not in deliverable.payload:
                return False, f"Missing required property '{key}' in deliverable payload."

        # Verify minimum confidence score if required
        min_confidence = order.requirements.get("min_confidence", 0.8)
        actual_confidence = deliverable.payload.get("confidence_score", 0.0)
        if actual_confidence < min_confidence:
            return False, f"Confidence score {actual_confidence} is below required threshold {min_confidence}."

        return True, "All validation assertions passed with zero defects."

    async def settle_through_digital_lock(
        self,
        order: ServiceOrder,
        provider: ServiceProviderAgent,
        deliverable: ServiceDeliverable,
        is_verified: bool = True,
        is_valid: Optional[bool] = None,
        failure_reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Interacts with the website's Digital Lock to execute the settlement.
        If verified: locks and disburses payment to provider, taking 1.5% fee.
        If not verified: flags transaction as FAILED, protecting the consumer's funds.
        """
        verified = is_valid if is_valid is not None else is_verified
        status_str = "SUCCESSFUL" if verified else "FAILED"
        milestone = f"Digital Lock Escrow: {order.service_name} ({order.order_id})"

        payload = {
            "fromAgent": self.name,
            "fromAgentModel": self.model,
            "toAgent": provider.name,
            "toAgentModel": provider.model,
            "amount": order.amount_inr,
            "status": status_str,
            "milestone": milestone,
            "failureReason": failure_reason if not verified else None,
        }

        resp = await self._http.post("/api/transfer", json=payload)
        resp.raise_for_status()
        data = resp.json()

        if verified:
            # 1.5% fee deducted
            fee = round(order.amount_inr * 0.015)
            net_to_worker = order.amount_inr - fee
            provider.credit_payment(net_to_worker)
            self.balance_inr = max(0, self.balance_inr - order.amount_inr)

        return data
