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

## Delegación a subagentes
Subagentes definidos en `.claude/agents/`. Delegar según área:
- **ecommerce-builder** → Features completas end-to-end (API + schema + modelo + React)
- **storefront-dev** → Componentes React, UI/UX, animaciones, estilos
- **db-migrator** → Migraciones Alembic, esquema de BD, índices
- **integration-specialist** → Cloudinary, MercadoPago, emails
- **deploy-ops** → Dockerfile, Railway, Vercel, health checks
- **qa-reviewer** → Revisión de calidad pre-merge, detección de deuda técnica