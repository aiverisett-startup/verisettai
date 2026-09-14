"""
FastAPI dependencies for authentication and database sessions.
"""

from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from verisett.core.database import get_db
from verisett.core.exceptions import AccountNotFoundError
from verisett.models.account import Account
from verisett.services.account_service import AccountService

security = HTTPBearer(auto_error=False)


async def get_current_account(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    session: AsyncSession = Depends(get_db),
) -> Account:
    """
    Authenticates request via Bearer token or X-API-Key header.
    Returns Account instance or raises 401 Unauthorized.
    """
    token = None
    if credentials:
        token = credentials.credentials
    elif x_api_key:
        token = x_api_key

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key. Provide via 'Authorization: Bearer <key>' or 'X-API-Key: <key>' header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        account = await AccountService.get_by_api_key(session, token)
        return account
    except AccountNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or unrecognized API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_current_account(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    session: AsyncSession = Depends(get_db),
) -> Optional[Account]:
    token = None
    if credentials:
        token = credentials.credentials
    elif x_api_key:
        token = x_api_key

    if not token:
        return None

    try:
        return await AccountService.get_by_api_key(session, token)
    except AccountNotFoundError:
        return None
