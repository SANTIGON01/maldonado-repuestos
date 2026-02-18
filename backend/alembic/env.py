"""
Alembic Environment Configuration - Async
Lee los modelos de SQLAlchemy y genera migraciones automáticas.
Por defecto apunta a localhost. Para Railway, usar variable DATABASE_URL.
"""
import asyncio
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

# Importar Base y todos los modelos para que Alembic los detecte
from app.database import Base
from app.models import (  # noqa: F401
    User, Category, Product, ProductImage,
    CartItem, Order, OrderItem, Quote, QuoteItem, Banner,
)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    """
    Obtiene la URL de la base de datos.
    Prioridad: variable de entorno DATABASE_URL > alembic.ini
    Convierte formatos postgres:// y postgresql:// a postgresql+asyncpg://
    """
    url = os.getenv("DATABASE_URL", config.get_main_option("sqlalchemy.url", ""))
    url = url.strip()
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def run_migrations_offline() -> None:
    """Genera SQL sin conectarse a la DB (para revisión manual)."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Ejecuta migraciones con engine async."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    """Ejecuta migraciones conectándose a la DB."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
