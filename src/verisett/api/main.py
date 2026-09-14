"""
Main FastAPI application entry point for Verisett AI Gateway.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from verisett.core.config import settings
from verisett.core.database import async_engine, Base, async_session_factory
from verisett.core.exceptions import (
    VerisettError,
    InsufficientFundsError,
    ContractNotFoundError,
    ContractStateError,
    ContractExpiredError,
    UnauthorizedWorkerError,
    SelfClaimNotAllowedError,
    AssertionVerificationFailedError,
    AccountNotFoundError,
)
from verisett.api.v1 import api_v1_router
from verisett.services.account_service import AccountService
from verisett.services.expiry_worker import expiry_worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema exists and platform treasury account is initialized
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        await AccountService.get_or_create_platform_account(session)
        await session.commit()

    # Start background contract expiry sweeper
    expiry_worker.start()

    yield

    # Shutdown
    await expiry_worker.stop()
    await async_engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Autonomous Agent Escrow & Settlement Gateway enabling programmatic escrow, strict assertion verification, and instant micro-settlements.",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Domain Exception Handlers
@app.exception_handler(InsufficientFundsError)
async def handle_insufficient_funds(request: Request, exc: InsufficientFundsError):
    return JSONResponse(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        content={"error": "INSUFFICIENT_FUNDS", "message": exc.message, "details": exc.details},
    )


@app.exception_handler(ContractNotFoundError)
async def handle_contract_not_found(request: Request, exc: ContractNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": "CONTRACT_NOT_FOUND", "message": exc.message, "details": exc.details},
    )


@app.exception_handler(AccountNotFoundError)
async def handle_account_not_found(request: Request, exc: AccountNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": "ACCOUNT_NOT_FOUND", "message": exc.message, "details": exc.details},
    )


@app.exception_handler(SelfClaimNotAllowedError)
async def handle_self_claim(request: Request, exc: SelfClaimNotAllowedError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"error": "SELF_CLAIM_FORBIDDEN", "message": exc.message, "details": exc.details},
    )


@app.exception_handler(UnauthorizedWorkerError)
async def handle_unauthorized_worker(request: Request, exc: UnauthorizedWorkerError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"error": "UNAUTHORIZED_WORKER", "message": exc.message, "details": exc.details},
    )


@app.exception_handler(ContractExpiredError)
async def handle_contract_expired(request: Request, exc: ContractExpiredError):
    return JSONResponse(
        status_code=status.HTTP_410_GONE,
        content={"error": "CONTRACT_EXPIRED", "message": exc.message, "details": exc.details},
    )


@app.exception_handler(ContractStateError)
async def handle_contract_state_error(request: Request, exc: ContractStateError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": "INVALID_STATE_TRANSITION", "message": exc.message, "details": exc.details},
    )


@app.exception_handler(AssertionVerificationFailedError)
async def handle_assertion_failed(request: Request, exc: AssertionVerificationFailedError):
    return JSONResponse(
        status_code=422,
        content={"error": "ASSERTION_FAILED", "message": exc.message, "details": exc.details},
    )


# Routers
app.include_router(api_v1_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Service health and heartbeat check."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
