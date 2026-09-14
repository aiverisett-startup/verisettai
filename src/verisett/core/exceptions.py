"""
Domain-specific exceptions for Verisett AI Gateway.
"""

from typing import Any, Optional


class VerisettError(Exception):
    """Base exception for all domain errors in Verisett."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class AccountNotFoundError(VerisettError):
    """Raised when an account with given ID or API key does not exist."""
    pass


class InsufficientFundsError(VerisettError):
    """Raised when an account does not have sufficient available balance."""
    def __init__(self, account_id: str, required_cents: int, available_cents: int):
        super().__init__(
            f"Account {account_id} has insufficient available balance: "
            f"required={required_cents} cents, available={available_cents} cents.",
            details={"account_id": account_id, "required_cents": required_cents, "available_cents": available_cents}
        )


class ContractNotFoundError(VerisettError):
    """Raised when a contract is not found."""
    def __init__(self, contract_id: str):
        super().__init__(
            f"Contract {contract_id} not found.",
            details={"contract_id": contract_id}
        )


class ContractStateError(VerisettError):
    """Raised when a state machine transition is invalid."""
    def __init__(self, contract_id: str, current_status: str, expected_status: str, action: str):
        super().__init__(
            f"Contract {contract_id} cannot perform '{action}' from state '{current_status}'. Expected state: '{expected_status}'.",
            details={
                "contract_id": contract_id,
                "current_status": current_status,
                "expected_status": expected_status,
                "action": action,
            }
        )


class ContractExpiredError(VerisettError):
    """Raised when an operation is attempted on an expired contract."""
    def __init__(self, contract_id: str, expired_at: str):
        super().__init__(
            f"Contract {contract_id} has expired at {expired_at}.",
            details={"contract_id": contract_id, "expired_at": expired_at}
        )


class UnauthorizedWorkerError(VerisettError):
    """Raised when a worker attempting to submit is not the claimed worker."""
    def __init__(self, contract_id: str, expected_worker: str, actual_worker: str):
        super().__init__(
            f"Unauthorized: Worker {actual_worker} is not the assigned worker {expected_worker} for contract {contract_id}.",
            details={"contract_id": contract_id, "expected_worker": expected_worker, "actual_worker": actual_worker}
        )


class SelfClaimNotAllowedError(VerisettError):
    """Raised when a payer attempts to claim their own contract."""
    def __init__(self, contract_id: str, payer_id: str):
        super().__init__(
            f"Payer {payer_id} cannot claim their own contract {contract_id}.",
            details={"contract_id": contract_id, "payer_id": payer_id}
        )


class AssertionVerificationFailedError(VerisettError):
    """Raised when output payload fails assertion validation."""
    def __init__(self, assertion_type: str, reason: str, details: Optional[Any] = None):
        super().__init__(
            f"Assertion verification failed for {assertion_type}: {reason}",
            details={"assertion_type": assertion_type, "reason": reason, "raw_details": details or {}}
        )
