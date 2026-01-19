"""
Maldonado Repuestos - FastAPI Backend
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import create_tables
from app.api import api_router
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events con retry para Railway"""
    import asyncio
    import os
    
    # Mostrar info de ambiente
    print(f"[Startup] Ambiente: {'PRODUCTION (Railway)' if os.getenv('RAILWAY_ENVIRONMENT') else 'DEVELOPMENT'}")
    print(f"[Startup] FRONTEND_URL: {settings.FRONTEND_URL}")
    
    # Retry de conexión a DB (Railway puede tardar en tener PostgreSQL listo)
    max_retries = 5
    retry_delay = 3
    
    for attempt in range(max_retries):
        try:
            print(f"[Startup] Conectando a DB (intento {attempt + 1}/{max_retries})...")
            await create_tables()
            print("[Startup] ✓ Conexión a DB exitosa!")
            break
        except Exception as e:
            print(f"[Startup] ✗ Error conectando a DB: {type(e).__name__}: {e}")
            if attempt < max_retries - 1:
                print(f"[Startup] Reintentando en {retry_delay} segundos...")
                await asyncio.sleep(retry_delay)
                retry_delay *= 2  # Backoff exponencial
            else:
                print("[Startup] ✗ No se pudo conectar a la DB después de varios intentos")
                raise
    
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
