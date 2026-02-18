# Maldonado Repuestos — E-commerce B2B

## Stack
- Backend: FastAPI + SQLAlchemy async + PostgreSQL (Railway) + Pydantic 2
- Frontend: React 18 + Vite + Zustand + TailwindCSS + Framer Motion
- Servicios: Cloudinary (imágenes), MercadoPago (pagos), aiosmtplib (emails)
- Deploy: Vercel (frontend) + Railway (backend + PostgreSQL)

## Estructura
- /backend/app/api/ → Endpoints FastAPI
- /backend/app/models/ → SQLAlchemy models
- /backend/app/schemas/ → Pydantic schemas
- /backend/app/services/ → Lógica de negocio
- /frontend/src/components/ → Componentes React
- /frontend/src/pages/ → Páginas
- /frontend/src/store/ → Zustand stores
- /frontend/src/services/ → API calls

## Convenciones
- Python: async/await obligatorio, type hints, docstrings
- Frontend: JSX (no TSX), Zustand para estado, colores maldonado-*
- SQL: SQLAlchemy ORM, nunca raw SQL salvo migraciones
- Commits: conventional commits en español

## Reglas críticas
- Rutas admin SIEMPRE con Depends(get_admin_user)
- Imágenes SIEMPRE via Cloudinary (nunca local)
- Variables sensibles en .env, nunca hardcodeadas
- PostgreSQL en prod, SQLite en dev

## Base de datos: Migraciones y Backups

### Alembic (migraciones)
Configurado en `backend/alembic.ini` + `backend/alembic/env.py` (async con asyncpg).

**Flujo: siempre probar en local antes de producción.**

```bash
cd backend

# 1. Crear migración tras modificar modelos SQLAlchemy
alembic revision --autogenerate -m "descripción del cambio"

# 2. Revisar el archivo generado en alembic/versions/

# 3. Aplicar en DB LOCAL
alembic upgrade head

# 4. Verificar que la app funciona con la DB local

# 5. Aplicar en RAILWAY (producción)
DATABASE_URL="postgresql+asyncpg://user:pass@host:port/db" alembic upgrade head
```

- La URL local está en `alembic.ini` (placeholder, ajustar en .env)
- Para Railway se pasa `DATABASE_URL` como variable de entorno
- `env.py` prioriza `DATABASE_URL` sobre `alembic.ini`
- Nunca correr migraciones en producción sin probar en local primero

### Backup de Railway
Script `backend/backup_db.py` — solo lectura sobre Railway.

```bash
cd backend

# Backup a PostgreSQL local (copia todas las tablas)
python backup_db.py

# Backup a archivos JSON
python backup_db.py --format json --output ./backups/
```

- Requiere `RAILWAY_DATABASE_URL` en `.env` o como variable de entorno
- La carpeta `backend/backups/` está en `.gitignore` (datos sensibles)
- Orden de tablas respeta foreign keys automáticamente
- Para DB local usa `LOCAL_DATABASE_URL` o default `localhost:5432/maldonado`

## Delegación a subagentes
Subagentes definidos en `.claude/agents/`. Delegar según área:
- **ecommerce-builder** → Features completas end-to-end (API + schema + modelo + React)
- **storefront-dev** → Componentes React, UI/UX, animaciones, estilos
- **db-migrator** → Migraciones Alembic, esquema de BD, índices
- **integration-specialist** → Cloudinary, MercadoPago, emails
- **deploy-ops** → Dockerfile, Railway, Vercel, health checks
- **qa-reviewer** → Revisión de calidad pre-merge, detección de deuda técnica