"""
Core domain constants and enumerations for Verisett AI Gateway.
"""

from enum import Enum


class AccountRole(str, Enum):
    PAYER = "payer"
    WORKER = "worker"
    DUAL = "dual"


class ContractStatus(str, Enum):
    DRAFT = "DRAFT"
    FUNDED = "FUNDED"
    CLAIMED = "CLAIMED"
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    SETTLED = "SETTLED"
    REFUNDED = "REFUNDED"
    DISPUTED = "DISPUTED"


class AssertionType(str, Enum):
    JSON_SCHEMA = "JSON_SCHEMA"
    HASH_MATCH = "HASH_MATCH"
    REGEX = "REGEX"
    LLM_JUDGE = "LLM_JUDGE"


class EntryType(str, Enum):
    DEPOSIT = "DEPOSIT"
    ESCROW_LOCK = "ESCROW_LOCK"
    ESCROW_RELEASE = "ESCROW_RELEASE"
    SETTLEMENT_PAYMENT = "SETTLEMENT_PAYMENT"
    FEE_COLLECTION = "FEE_COLLECTION"
    REFUND = "REFUND"
