"""
Configuration settings using Pydantic Settings
Todas las variables sensibles se configuran via variables de entorno en produccion.
En Railway, DATABASE_URL se configura automaticamente al agregar PostgreSQL.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Maldonado Repuestos API"
    DEBUG: bool = False
    
    # Database - Se configura via variable de entorno DATABASE_URL
    # Railway genera automaticamente esta variable al agregar PostgreSQL
    # En desarrollo local usa PostgreSQL local
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Santi2012@localhost:5432/maldonado"
    
    # Security - IMPORTANTE: Cambiar en produccion via variable de entorno
    SECRET_KEY: str = "dev-secret-key-change-in-production-use-64-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # MercadoPago
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # CORS - URL del frontend (Vercel en produccion)
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def get_database_url(self) -> str:
        """Convierte DATABASE_URL de Railway (postgres://) a formato asyncpg"""
        import os
        url = self.DATABASE_URL
        
        # Debug: ver qué URL está llegando (útil para diagnosticar en Railway)
        env_url = os.getenv('DATABASE_URL', 'NOT SET')
        if env_url != 'NOT SET':
            # Ocultar password en logs
            safe_url = env_url.split('@')[1] if '@' in env_url else env_url[:30]
            print(f"[Config] DATABASE_URL from env: ...@{safe_url}")
        else:
            print(f"[Config] DATABASE_URL: usando valor por defecto (localhost)")
        
        # Railway usa postgres:// pero asyncpg necesita postgresql+asyncpg://
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

