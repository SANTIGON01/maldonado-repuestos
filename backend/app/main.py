"""
Maldonado Repuestos - FastAPI Backend
"""
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.config import settings
from sqlalchemy import text
from app.database import create_tables
from app.api import api_router
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events con retry para Railway"""
    import asyncio
    import os

    is_production = os.getenv('RAILWAY_ENVIRONMENT') is not None
    run_create_tables = os.getenv('RUN_CREATE_TABLES', 'false').lower() == 'true'

    # Mostrar info de ambiente
    print(f"[Startup] Ambiente: {'PRODUCTION (Railway)' if is_production else 'DEVELOPMENT'}")
    print(f"[Startup] FRONTEND_URL: {settings.FRONTEND_URL}")
    print(f"[Startup] RUN_CREATE_TABLES: {run_create_tables}")

    # Log de configuración de Cloudinary
    print("=" * 60)
    print("[STARTUP] Verificando configuración de Cloudinary...")
    print(f"[STARTUP] CLOUDINARY_CLOUD_NAME: {settings.CLOUDINARY_CLOUD_NAME or 'NO CONFIGURADO'}")
    print(f"[STARTUP] CLOUDINARY_API_KEY: {'Configurado' if settings.CLOUDINARY_API_KEY else 'NO CONFIGURADO'}")
    print(f"[STARTUP] CLOUDINARY_API_SECRET: {'Configurado' if settings.CLOUDINARY_API_SECRET else 'NO CONFIGURADO'}")
    print("=" * 60)

    # En producción, solo crear tablas si se pide explícitamente
    # En desarrollo, siempre crear tablas
    should_create_tables = run_create_tables or not is_production

    if should_create_tables:
        # Retry de conexión a DB (Railway puede tardar en tener PostgreSQL listo)
        max_retries = 5
        retry_delay = 3

        for attempt in range(max_retries):
            try:
                print(f"[Startup] Conectando a DB (intento {attempt + 1}/{max_retries})...")
                await create_tables()
                print("[Startup] OK - Conexion a DB exitosa y tablas verificadas!")
                break
            except Exception as e:
                print(f"[Startup] ERROR - Error conectando a DB: {type(e).__name__}: {e}")
                if attempt < max_retries - 1:
                    print(f"[Startup] Reintentando en {retry_delay} segundos...")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Backoff exponencial
                else:
                    print("[Startup] ERROR - No se pudo conectar a la DB despues de varios intentos")
                    raise
    else:
        print("[Startup] Saltando create_tables (producción con datos migrados)")
        # Solo verificamos conexión sin crear tablas
        from app.database import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("[Startup] OK - Conexion a DB verificada!")

    yield
    # Shutdown: cleanup if needed
    print("[Shutdown] Aplicación cerrándose...")


app = FastAPI(
    title=settings.APP_NAME,
    description="API para el e-commerce de repuestos para semirremolques y acoplados",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Lista de orígenes permitidos (CORS)
# En produccion, FRONTEND_URL apunta a Vercel (https://...)
# En desarrollo, usa localhost
_origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite default port
]
# Filtrar duplicados y valores vacios
origins = list(set(filter(None, _origins)))

# CORS - Configuración ampliada
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# GZip - Compresión para respuestas grandes (mejora performance)
app.add_middleware(GZipMiddleware, minimum_size=1000)


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

# Configurar carpeta de uploads para servir imágenes estáticas
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "products").mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


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
