"""
Configuration settings using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Maldonado Repuestos API"
    DEBUG: bool = False
    
    # Database - PostgreSQL por defecto (local)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Santi2012@localhost:5432/maldonado"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # MercadoPago
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Cloudinary Image Storage
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


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

