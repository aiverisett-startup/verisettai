"""
API v1 Router aggregation.
"""

from fastapi import APIRouter
from verisett.api.v1.contracts import router as contracts_router
from verisett.api.v1.accounts import router as accounts_router

api_v1_router = APIRouter(prefix="/v1")
api_v1_router.include_router(accounts_router)
api_v1_router.include_router(contracts_router)
