"""
SQLAlchemy Async Database Configuration
Optimizado para multiples usuarios concurrentes en produccion.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings
import os


# Obtener URL de base de datos (convierte formato Railway a asyncpg)
database_url = settings.get_database_url()

# Configuracion del pool segun entorno
# Con 4 workers, cada uno necesita conexiones
# Railway Hobby: pool_size=5 por worker = 20 total, max_overflow=10 por worker = 40 total
IS_PRODUCTION = os.getenv("RAILWAY_ENVIRONMENT") is not None

# Create async engine - optimizado para produccion con multiples workers
engine = create_async_engine(
    database_url,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,       # Verifica conexiones antes de usarlas (evita errores)
    pool_size=5 if IS_PRODUCTION else 10,         # Conexiones por worker
    max_overflow=10 if IS_PRODUCTION else 20,     # Conexiones extras por worker
    pool_recycle=1800,        # Reciclar conexiones cada 30 min (Railway puede cerrarlas)
    pool_timeout=30,          # Timeout para obtener conexion del pool
    connect_args={
        "command_timeout": 60,  # Timeout para queries (evita queries colgados)
    } if "postgresql" in database_url else {},
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Base class for models
class Base(DeclarativeBase):
    pass


# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Create all tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Drop all tables (for testing)
async def drop_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

