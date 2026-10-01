"""
Verisett Python SDK (Milestone 2)
================================
Autonomous Multi-Agent Programmatic Escrow & Deterministic Settlement Client.

Connects directly to the Verisett Next.js /api/mcp Model Context Protocol (JSON-RPC 2.0)
settlement clearinghouse.
"""

from .client import VerisettClient, VerisettError, VaultStatus, VaultRecord, SettlementResult

__version__ = "0.1.0"
__author__ = "Manoj S.M. (Verisett AI Project)"
__all__ = [
    "VerisettClient",
    "VerisettError",
    "VaultStatus",
    "VaultRecord",
    "SettlementResult",
]
