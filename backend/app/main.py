"""
Maldonado Repuestos - FastAPI Backend
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import create_tables
from app.api import api_router
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup: Create tables
    await create_tables()

    # Log de configuración de Cloudinary
    print("=" * 60)
    print("[STARTUP] Verificando configuración de Cloudinary...")
    print(f"[STARTUP] CLOUDINARY_CLOUD_NAME: {settings.CLOUDINARY_CLOUD_NAME or 'NO CONFIGURADO'}")
    print(f"[STARTUP] CLOUDINARY_API_KEY: {'Configurado' if settings.CLOUDINARY_API_KEY else 'NO CONFIGURADO'}")
    print(f"[STARTUP] CLOUDINARY_API_SECRET: {'Configurado' if settings.CLOUDINARY_API_SECRET else 'NO CONFIGURADO'}")
    print("=" * 60)

    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title=settings.APP_NAME,
    description="API para el e-commerce de repuestos para semirremolques y acoplados",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Lista de orígenes permitidos
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# CORS - Configuración ampliada
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Manejador global de excepciones para garantizar headers CORS
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Captura todas las excepciones y devuelve respuesta con CORS headers"""
    print(f"ERROR: {exc}")
    print(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno del servidor: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
        }
    )


# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """API health check"""
    return {"status": "healthy"}


@app.get("/debug/env")
async def debug_environment():
    """
    Debug endpoint para verificar variables de entorno
    SOLO PARA DESARROLLO - Eliminar en producción
    """
    import os

    return {
        "cloudinary_configured": bool(
            settings.CLOUDINARY_CLOUD_NAME
            and settings.CLOUDINARY_API_KEY
            and settings.CLOUDINARY_API_SECRET
        ),
        "cloudinary_cloud_name": settings.CLOUDINARY_CLOUD_NAME or "NOT SET",
        "cloudinary_api_key_present": bool(settings.CLOUDINARY_API_KEY),
        "cloudinary_api_secret_present": bool(settings.CLOUDINARY_API_SECRET),
        # Ver directamente desde os.environ
        "env_cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME", "NOT IN OS.ENVIRON"),
        "env_api_key_present": bool(os.getenv("CLOUDINARY_API_KEY")),
        "env_api_secret_present": bool(os.getenv("CLOUDINARY_API_SECRET")),
        # Otras variables para verificar
        "database_url_present": bool(settings.DATABASE_URL),
        "frontend_url": settings.FRONTEND_URL,
    }
