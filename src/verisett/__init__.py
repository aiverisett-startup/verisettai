"""
Verisett AI - Autonomous Agent Escrow & Settlement Gateway.
"""

from verisett.client import VerisettClient, VerisettError
from verisett.core.constants import AssertionType, ContractStatus, EntryType, AccountRole

__version__ = "0.1.0"

__all__ = [
    "VerisettClient",
    "VerisettError",
    "AssertionType",
    "ContractStatus",
    "EntryType",
    "AccountRole",
]
