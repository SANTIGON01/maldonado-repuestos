"""
Configuration settings using Pydantic Settings
Todas las variables sensibles se configuran via variables de entorno en produccion.
En Railway, DATABASE_URL se configura automaticamente al agregar PostgreSQL.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Maldonado Repuestos API"
    DEBUG: bool = False
    
    # Database - Se configura via variable de entorno DATABASE_URL
    # Railway genera automaticamente esta variable al agregar PostgreSQL
    # En desarrollo local usa PostgreSQL local
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Santi2012@localhost:5432/maldonado"
    
    @field_validator('DATABASE_URL', mode='before')
    @classmethod
    def strip_database_url(cls, v: str) -> str:
        """Limpia espacios y saltos de línea de la URL de base de datos"""
        if isinstance(v, str):
            return v.strip()
        return v
    
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
    NOTIFICATION_EMAIL: str = "repuestos@maldonadosaci.com"
    
    # Railway Database (solo para backups, no usado por la app)
    RAILWAY_DATABASE_URL: str = ""

    # CORS - URL del frontend (Vercel en produccion)
    FRONTEND_URL: str = "http://localhost:3000"

    # Cloudinary - Para almacenamiento de imágenes en producción
    # Crear cuenta gratis en https://cloudinary.com
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def get_database_url(self) -> str:
        """Convierte DATABASE_URL de Railway (postgres://) a formato asyncpg"""
        import os
        # IMPORTANTE: strip() para quitar espacios/saltos de línea invisibles
        url = self.DATABASE_URL.strip()
        
        # Debug: ver qué URL está llegando (útil para diagnosticar en Railway)
        env_url = os.getenv('DATABASE_URL', 'NOT SET')
        if env_url != 'NOT SET':
            env_url = env_url.strip()  # Limpiar también aquí
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

# Fallback: Si Pydantic no carga las variables, leer directamente de os.environ
# Esto es especialmente útil en Railway/Vercel donde las variables se inyectan directamente
if not settings.CLOUDINARY_CLOUD_NAME:
    settings.CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
if not settings.CLOUDINARY_API_KEY:
    settings.CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
if not settings.CLOUDINARY_API_SECRET:
    settings.CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

# Debug: Imprimir estado de variables de Cloudinary
print(f"[CONFIG] Cloudinary Cloud Name: {settings.CLOUDINARY_CLOUD_NAME or 'NOT SET'}")
print(f"[CONFIG] Cloudinary API Key: {'SET' if settings.CLOUDINARY_API_KEY else 'NOT SET'}")
print(f"[CONFIG] Cloudinary API Secret: {'SET' if settings.CLOUDINARY_API_SECRET else 'NOT SET'}")

