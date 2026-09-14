"""
Verisett Python Client SDK.
High-level async client enabling autonomous agents to lock programmatic escrow,
verify dynamic assertions, and execute instant micro-settlements in under 60 seconds.
"""

from typing import Any, Dict, Optional
import httpx


class VerisettError(Exception):
    """Base exception for Verisett SDK errors."""
    def __init__(self, message: str, status_code: Optional[int] = None, details: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details


class VerisettClient:
    """
    Async client for Verisett AI Gateway.

    Usage:
        ```python
        from verisett import VerisettClient

        async with VerisettClient(api_key="vs_live_...", base_url="http://localhost:8000") as client:
            # 1. Lock programmatic escrow
            escrow = await client.create_escrow(
                task_description="Extract quarterly revenue from SEC filing",
                amount_cents=50, # $0.50
                expected_schema={
                    "type": "object",
                    "required": ["ticker", "revenue_usd", "fiscal_year"],
                    "properties": {
                        "ticker": {"type": "string"},
                        "revenue_usd": {"type": "number"},
                        "fiscal_year": {"type": "integer"}
                    }
                }
            )

            # 2. Worker claims task
            # await worker_client.claim_task(escrow["contract_id"])

            # 3. Worker submits proof & settles
            # settlement = await worker_client.verify_and_settle(
            #     escrow["contract_id"],
            #     payload={"ticker": "NVDA", "revenue_usd": 30040000000, "fiscal_year": 2025}
            # )
        ```
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "http://localhost:8000",
        timeout: float = 30.0,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self) -> "VerisettClient":
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "verisett-python-sdk/0.1.0",
            },
            timeout=self.timeout,
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()
            self._client = None

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "verisett-python-sdk/0.1.0",
                },
                timeout=self.timeout,
            )
        return self._client

    async def close(self):
        """Close the underlying HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def create_escrow(
        self,
        task_description: str,
        amount_cents: int,
        expected_schema: Dict[str, Any],
        timeout_seconds: int = 300,
        assertion_type: str = "JSON_SCHEMA",
    ) -> Dict[str, Any]:
        """
        Create and fund a programmatic escrow contract with row-level locks.
        """
        client = self._ensure_client()
        # Merge task description into assertion payload
        payload = {
            "amount_cents": amount_cents,
            "assertion_type": assertion_type.upper(),
            "assertion_payload": {
                "task_description": task_description,
                "schema": expected_schema if "schema" not in expected_schema else expected_schema["schema"],
                **{k: v for k, v in expected_schema.items() if k != "schema"}
            },
            "timeout_seconds": timeout_seconds,
        }

        response = await client.post("/v1/contracts/create", json=payload)
        if response.status_code != 201:
            raise VerisettError(
                f"Failed to create escrow: {response.text}",
                status_code=response.status_code,
                details=response.json() if response.headers.get("content-type") == "application/json" else None,
            )
        return response.json()

    async def claim_task(self, task_id: str) -> Dict[str, Any]:
        """
        Claim an active funded escrow task as a worker agent. Starts the TTL countdown timer.
        """
        client = self._ensure_client()
        response = await client.post(f"/v1/contracts/{task_id}/claim")
        if response.status_code != 200:
            raise VerisettError(
                f"Failed to claim task: {response.text}",
                status_code=response.status_code,
                details=response.json() if response.headers.get("content-type") == "application/json" else None,
            )
        return response.json()

    async def verify_and_settle(self, task_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit output proof for dynamic verification.
        If valid, instantly clears funds to worker (98.5%) and collects platform take-rate (1.5%).
        """
        client = self._ensure_client()
        response = await client.post(
            f"/v1/contracts/{task_id}/submit",
            json={"output_payload": payload},
        )
        if response.status_code != 200:
            raise VerisettError(
                f"Settlement failed: {response.text}",
                status_code=response.status_code,
                details=response.json() if response.headers.get("content-type") == "application/json" else None,
            )
        return response.json()

    async def get_status(self, task_id: str) -> Dict[str, Any]:
        """
        Retrieve contract state, timestamps, parameters, and full audit ledger trail.
        """
        client = self._ensure_client()
        response = await client.get(f"/v1/contracts/{task_id}/status")
        if response.status_code != 200:
            raise VerisettError(
                f"Failed to fetch contract status: {response.text}",
                status_code=response.status_code,
            )
        return response.json()

    async def check_balance(self) -> Dict[str, Any]:
        """
        Check available, frozen, and total balance for the authenticated agent.
        """
        client = self._ensure_client()
        response = await client.get("/v1/accounts/me")
        if response.status_code != 200:
            raise VerisettError(
                f"Failed to fetch account balance: {response.text}",
                status_code=response.status_code,
            )
        return response.json()

    async def deposit(self, amount_cents: int) -> Dict[str, Any]:
        """
        Simulate deposit into agent vault balance.
        """
        client = self._ensure_client()
        me = await self.check_balance()
        account_id = me["id"]
        response = await client.post(
            f"/v1/accounts/{account_id}/deposit",
            json={"amount_cents": amount_cents},
        )
        if response.status_code != 200:
            raise VerisettError(
                f"Deposit failed: {response.text}",
                status_code=response.status_code,
            )
        return response.json()
