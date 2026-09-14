"""
Database connection, session management, and base models for SQLAlchemy 2.0.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from verisett.core.config import settings

# Engine configuration with pooling
engine_kwargs = {"echo": settings.DATABASE_ECHO}
if "sqlite" in settings.DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = 20
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_pre_ping"] = True

async_engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy 2.0 models."""
    pass


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Returns the current async session factory."""
    return async_session_factory


def set_async_session_factory(factory: async_sessionmaker[AsyncSession]) -> None:
    """Sets the active async session factory (useful for testing and dependency injection)."""
    global async_session_factory
    async_session_factory = factory


def set_async_engine(engine) -> None:
    """Sets the active async engine and updates the session factory."""
    global async_engine, async_session_factory
    async_engine = engine
    async_session_factory = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

