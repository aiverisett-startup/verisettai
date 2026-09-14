"""
Background Expiry Worker for Verisett AI Gateway.
Monitors claimed contracts past their expiration time-to-live and executes atomic refunds.
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from verisett.core.config import settings
from verisett.core.constants import ContractStatus
from verisett.core.database import get_session_factory
from verisett.models.contract import Contract
from verisett.models.base import to_utc_aware
from verisett.services.escrow_service import EscrowService

logger = logging.getLogger("verisett.expiry_worker")


class ExpiryWorker:
    def __init__(self, interval_seconds: int = settings.EXPIRY_WORKER_INTERVAL_SECONDS):
        self.interval_seconds = interval_seconds
        self._is_running = False
        self._task: asyncio.Task | None = None

    async def run_sweep_once(self) -> List[str]:
        """Runs a single pass to find and refund expired contracts."""
        refunded_contract_ids = []
        now = datetime.now(timezone.utc)

        async with get_session_factory()() as session:
            try:
                # Find all claimed contracts whose TTL has passed
                stmt = (
                    select(Contract.id, Contract.expires_at)
                    .where(
                        Contract.status == ContractStatus.CLAIMED,
                        Contract.expires_at.is_not(None)
                    )
                )
                res = await session.execute(stmt)
                rows = res.all()
                expired_ids = []
                for cid, exp in rows:
                    exp_utc = to_utc_aware(exp)
                    if exp_utc and now >= exp_utc:
                        expired_ids.append(cid)

                for contract_id in expired_ids:
                    try:
                        await EscrowService.expire_and_refund(session, contract_id)
                        await session.commit()
                        refunded_contract_ids.append(contract_id)
                        logger.info(f"Successfully refunded expired contract: {contract_id}")
                    except Exception as err:
                        await session.rollback()
                        logger.error(f"Failed to refund expired contract {contract_id}: {err}")


            except Exception as e:
                logger.error(f"Error during expiry worker sweep: {e}")

        return refunded_contract_ids

    async def _worker_loop(self):
        logger.info(f"Verisett Expiry Worker started with interval {self.interval_seconds}s.")
        while self._is_running:
            try:
                await self.run_sweep_once()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Unexpected error in expiry worker loop: {e}")

            await asyncio.sleep(self.interval_seconds)

        logger.info("Verisett Expiry Worker stopped.")

    def start(self):
        if not self._is_running:
            self._is_running = True
            self._task = asyncio.create_task(self._worker_loop())

    async def stop(self):
        if self._is_running:
            self._is_running = False
            if self._task:
                self._task.cancel()
                try:
                    await self._task
                except asyncio.CancelledError:
                    pass
                self._task = None


expiry_worker = ExpiryWorker()
