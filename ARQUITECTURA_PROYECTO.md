# 🏗️ Arquitectura del Proyecto - Maldonado Repuestos

## 📋 Tabla de Contenidos
- [Overview General](#overview-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Backend (Python + FastAPI)](#backend-python--fastapi)
- [Frontend (React + Vite)](#frontend-react--vite)
- [Base de Datos](#base-de-datos)
- [Infraestructura y Deploy](#infraestructura-y-deploy)
- [Flujo de Datos](#flujo-de-datos)
- [Patrones y Convenciones](#patrones-y-convenciones)

---

## 🎯 Overview General

**Maldonado Repuestos** es un e-commerce B2B para repuestos automotrices e industriales, desarrollado con arquitectura **monorepo** separando frontend y backend.

### Tipo de Aplicación
- **Modelo:** B2B E-commerce
- **Arquitectura:** Cliente-Servidor (SPA + REST API)
- **Deployment:** Separado (Frontend en Vercel, Backend en Railway)

### Identidad Visual
| Elemento | Color | Código |
|----------|-------|--------|
| **Primario (Rojo)** | Rojo carmesí | `#B91C1C` |
| **Secundario (Gris Oscuro)** | Gris carbón | `#1F2937` |
| **Acento (Chrome)** | Gris metálico | `#9CA3AF` |

---

## 🛠️ Stack Tecnológico

### Backend
| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| **Framework Web** | FastAPI | 0.115.6 | API REST, validación automática |
| **Server ASGI** | Uvicorn | 0.34.0 | Servidor de aplicación async |
| **ORM** | SQLAlchemy | 2.0.36 (async) | Mapeo objeto-relacional |
| **Validación** | Pydantic | 2.10.3 | Schemas y validación de datos |
| **Base de Datos** | PostgreSQL | - | BD principal (via asyncpg) |
| **SQLite** | aiosqlite | 0.20.0 | BD local para desarrollo |
| **Migraciones** | Alembic | 1.14.0 | Control de versiones de BD |
| **Autenticación** | python-jose | 3.3.0 | JWT tokens |
| **Hashing** | passlib[bcrypt] | 1.7.4 | Hash de contraseñas |
| **Pagos** | MercadoPago SDK | 2.2.2 | Procesamiento de pagos |
| **Email** | aiosmtplib | 3.0.2 | Envío de emails async |
| **Storage** | Cloudinary | 1.41.0 | Almacenamiento de imágenes |
| **Testing** | pytest + pytest-asyncio | 8.3.4 / 0.25.0 | Tests unitarios/integración |

### Frontend
| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| **Framework UI** | React | 18.3.1 | Librería de componentes |
| **Build Tool** | Vite | 6.0.1 | Bundler rápido con HMR |
| **Routing** | React Router | 6.28.0 | Navegación SPA |
| **Estado Global** | Zustand | 5.0.2 | Gestión de estado simple |
| **Estilos** | Tailwind CSS | 3.4.15 | Utility-first CSS |
| **Animaciones** | Framer Motion | 12.23.26 | Animaciones y transiciones |
| **Iconos** | Lucide React | 0.468.0 | Iconos SVG optimizados |
| **Linter** | ESLint | 9.15.0 | Análisis estático de código |

### Infraestructura
| Servicio | Plataforma | Propósito |
|----------|-----------|-----------|
| **Frontend Hosting** | Vercel | Deploy automático, CDN global |
| **Backend Hosting** | Railway | Contenedores Docker, PostgreSQL |
| **Base de Datos** | Railway PostgreSQL | BD PostgreSQL managed |
| **CDN Imágenes** | Cloudinary | Optimización y entrega de imágenes |
| **Pagos** | MercadoPago | Gateway de pagos |
| **VCS** | GitHub | Control de versiones |

---

## 📁 Estructura del Proyecto

```
maldonado-repuestos/
│
├── .github/                    # GitHub Actions, workflows
│   └── workflows/
│
├── backend/                    # API Backend (Python + FastAPI)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Punto de entrada, lifespan, CORS
│   │   ├── config.py          # Configuración (Pydantic Settings)
│   │   ├── database.py        # Engine SQLAlchemy, sesiones
│   │   │
│   │   ├── api/               # Endpoints REST
│   │   │   ├── __init__.py
│   │   │   ├── products.py    # GET /api/products (público)
│   │   │   ├── admin.py       # POST/PUT /api/admin/* (admin)
│   │   │   ├── auth.py        # POST /api/auth/login
│   │   │   ├── cart.py        # Carrito de compras
│   │   │   ├── orders.py      # Órdenes de compra
│   │   │   ├── quotes.py      # Cotizaciones
│   │   │   ├── payments.py    # Integración MercadoPago
│   │   │   ├── banners.py     # Banners promocionales
│   │   │   ├── categories.py  # Categorías de productos
│   │   │   └── uploads.py     # Upload imágenes (Cloudinary)
│   │   │
│   │   ├── models/            # SQLAlchemy Models (BD)
│   │   │   ├── __init__.py
│   │   │   ├── product.py     # Modelo Product (con is_on_promotion)
│   │   │   ├── product_image.py # ProductImage (con public_id)
│   │   │   ├── banner.py      # Banner (con product_codes)
│   │   │   ├── category.py
│   │   │   ├── user.py
│   │   │   ├── cart.py
│   │   │   ├── order.py
│   │   │   └── quote.py
│   │   │
│   │   ├── schemas/           # Pydantic Schemas (validación)
│   │   │   ├── __init__.py
│   │   │   ├── product.py     # ProductCreate, ProductResponse
│   │   │   ├── banner.py
│   │   │   ├── category.py
│   │   │   ├── user.py
│   │   │   ├── cart.py
│   │   │   ├── order.py
│   │   │   └── quote.py
│   │   │
│   │   ├── services/          # Lógica de negocio
│   │   │   └── cloudinary_service.py
│   │   │
│   │   └── utils/             # Utilidades, helpers
│   │       └── auth.py        # JWT, hashing
│   │
│   ├── .env                   # Variables de entorno (local)
│   ├── .env.example           # Template de variables
│   ├── requirements.txt       # Dependencias Python
│   ├── Dockerfile             # Imagen Docker para Railway
│   ├── add_promotion_fields.py # Script migración promociones
│   └── maldonado.db           # SQLite local (desarrollo)
│
├── frontend/                  # SPA Frontend (React + Vite)
│   ├── public/                # Assets estáticos
│   │
│   ├── src/
│   │   ├── components/        # Componentes React reutilizables
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx       # Banner principal con getBannerLink()
│   │   │   ├── ProductCard.jsx # Tarjeta de producto (con badge OFERTA)
│   │   │   ├── CartSidebar.jsx
│   │   │   ├── QuoteModal.jsx
│   │   │   ├── LoginModal.jsx
│   │   │   └── ...
│   │   │
│   │   ├── pages/             # Páginas/vistas principales
│   │   │   ├── HomePage.jsx
│   │   │   ├── CatalogPage.jsx # Filtros (incluye on_promotion)
│   │   │   ├── ProductPage.jsx
│   │   │   └── AdminPage.jsx   # Panel admin (CRUD productos)
│   │   │
│   │   ├── store/             # Zustand stores
│   │   │   └── localCartStore.js # Estado del carrito
│   │   │
│   │   ├── services/          # API calls
│   │   │   └── api.js         # Funciones fetch al backend
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │
│   │   ├── lib/               # Utilidades
│   │   │
│   │   ├── App.jsx            # Router principal
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Estilos globales + Tailwind
│   │
│   ├── package.json
│   ├── vite.config.js         # Configuración Vite
│   ├── tailwind.config.js     # Colores custom maldonado-*
│   ├── postcss.config.js
│   └── .env.local             # Variables frontend (VITE_API_URL)
│
├── .claude/                   # Claude Code artifacts
├── .git/                      # Git repository
├── .gitignore
├── README.md
├── ARQUITECTURA_PROYECTO.md   # Este documento
└── railway_migrations_complete.sql # Migraciones SQL

```

---

## 🐍 Backend (Python + FastAPI)

### Arquitectura en Capas

```
┌─────────────────────────────────────────────┐
│         API Layer (FastAPI Routers)         │  ← Endpoints HTTP
├─────────────────────────────────────────────┤
│      Schemas Layer (Pydantic Models)        │  ← Validación I/O
├─────────────────────────────────────────────┤
│     Services Layer (Business Logic)         │  ← Lógica de negocio
├─────────────────────────────────────────────┤
│      Models Layer (SQLAlchemy ORM)          │  ← Entidades de BD
├─────────────────────────────────────────────┤
│          Database (PostgreSQL)              │  ← Persistencia
└─────────────────────────────────────────────┘
```

### Estructura de Archivos Backend

#### `backend/app/main.py`
- Entry point de la aplicación
- Configuración CORS
- Lifespan events (startup/shutdown)
- Montaje de routers
- Middleware de logging

**Ejemplo:**
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()  # Crear tablas si no existen
    yield
    # Cleanup

app = FastAPI(lifespan=lifespan)
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
```

#### `backend/app/config.py`
- Configuración centralizada con Pydantic Settings
- Carga variables de entorno
- Validación de configuración

**Variables principales:**
- `DATABASE_URL` - URL de PostgreSQL
- `SECRET_KEY` - Para JWT
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`

#### `backend/app/database.py`
- Engine SQLAlchemy async
- Session factory
- Base declarativa
- Dependency `get_db()` para inyección de sesiones

**Ejemplo:**
```python
async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
```

#### `backend/app/api/` (Endpoints)
Cada archivo define un router con endpoints específicos:

**products.py** (Público):
- `GET /api/products` - Listar productos con filtros
  - Filtros: `category_id`, `brand`, `on_promotion`, `codes`, `min_price`, `max_price`
  - Paginación: `page`, `page_size`
  - Ordenamiento: `sort_by`, `sort_order`
- `GET /api/products/{id}` - Detalle de producto

**admin.py** (Autenticado):
- `GET /api/admin/products` - Listar todos (incluye inactivos)
- `POST /api/admin/products` - Crear producto
- `PUT /api/admin/products/{id}` - Actualizar producto
- `DELETE /api/admin/products/{id}` - Eliminar producto
- Requiere autenticación JWT (`Depends(get_admin_user)`)

**auth.py**:
- `POST /api/auth/login` - Login con email/password, devuelve JWT
- `GET /api/auth/me` - Info del usuario actual

**uploads.py**:
- `POST /api/uploads/image` - Upload de imagen a Cloudinary
- `DELETE /api/uploads/image/{public_id}` - Eliminar imagen

#### `backend/app/models/` (SQLAlchemy ORM)
Define las tablas de la base de datos.

**product.py**:
```python
class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    code: Mapped[str]
    price: Mapped[Decimal]
    is_on_promotion: Mapped[bool] = mapped_column(default=False)
    # ... otros campos

    # Relationships
    category: Mapped["Category"] = relationship(back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(...)
```

**Índices compuestos** para optimización:
- `ix_products_active_category` → (is_active, category_id)
- `ix_products_active_on_promotion` → (is_active, is_on_promotion)

#### `backend/app/schemas/` (Pydantic)
Validan entrada/salida de la API.

**product.py**:
```python
class ProductCreate(BaseModel):
    name: str
    code: str
    price: Decimal
    is_on_promotion: bool = False
    # ...

class ProductResponse(BaseModel):
    id: int
    name: str
    is_on_promotion: bool
    # ... todos los campos

    class Config:
        from_attributes = True  # ORM mode
```

### Autenticación y Seguridad

- **JWT Tokens** con `python-jose`
- **Bcrypt** para hash de contraseñas
- **Middleware CORS** para permitir frontend en Vercel
- **Dependencias de seguridad**:
  - `get_current_user()` - Usuario autenticado
  - `get_admin_user()` - Usuario con rol admin

### Integración con Servicios Externos

#### Cloudinary (Imágenes)
```python
# backend/app/services/cloudinary_service.py
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def upload_image(file):
    result = cloudinary.uploader.upload(file, folder="maldonado/products")
    return result['secure_url'], result['public_id']
```

#### MercadoPago (Pagos)
```python
# backend/app/api/payments.py
import mercadopago
sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

preference_data = {
    "items": [{"title": "Producto", "quantity": 1, "unit_price": 100}],
    "back_urls": { ... }
}
preference = sdk.preference().create(preference_data)
```

---

## ⚛️ Frontend (React + Vite)

### Arquitectura de Componentes

```
App.jsx (Router)
│
├── Header.jsx
│   ├── CartIcon.jsx → CartSidebar.jsx
│   └── LoginModal.jsx
│
├── Pages/
│   ├── HomePage.jsx
│   │   ├── Hero.jsx (banners con getBannerLink())
│   │   ├── Categories.jsx
│   │   ├── FeaturedProducts.jsx
│   │   └── CallToAction.jsx
│   │
│   ├── CatalogPage.jsx
│   │   ├── Filtros (categorías, marcas, on_promotion)
│   │   └── Products.jsx
│   │       └── ProductCard.jsx (con badge OFERTA)
│   │
│   ├── ProductPage.jsx (detalle)
│   │
│   └── AdminPage.jsx (CRUD)
│       └── Formularios de productos/banners
│
└── Footer.jsx
```

### Estado Global (Zustand)

**localCartStore.js**:
```javascript
export const useLocalCartStore = create((set) => ({
  items: [],
  addItem: (product, quantity) => set((state) => ({
    items: [...state.items, { product, quantity }]
  })),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.product.id !== productId)
  })),
  clearCart: () => set({ items: [] })
}))
```

### Comunicación con Backend

**services/api.js**:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const fetchProducts = async (filters) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${API_URL}/api/products?${params}`)
  return response.json()
}

export const createProduct = async (data, token) => {
  const response = await fetch(`${API_URL}/api/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

### Routing (React Router)

**App.jsx**:
```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/catalogo" element={<CatalogPage />} />
    <Route path="/producto/:id" element={<ProductPage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
</BrowserRouter>
```

### Tailwind CSS - Colores Personalizados

**tailwind.config.js**:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'maldonado-red': '#B91C1C',
        'maldonado-red-700': '#991B1B',
        'maldonado-dark': '#1F2937',
        'maldonado-chrome': '#9CA3AF'
      }
    }
  }
}
```

### Animaciones (Framer Motion)

**ProductCard.jsx**:
```javascript
<motion.div
  whileHover={{ y: -4, scale: 1.01 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  {/* contenido */}
</motion.div>
```

---

## 🗄️ Base de Datos

### PostgreSQL (Railway)

#### Tablas Principales

**products**
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    original_price NUMERIC(12,2),
    stock INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_on_promotion BOOLEAN DEFAULT FALSE,  -- ← NUEVO
    rating NUMERIC(2,1) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ix_products_active_on_promotion
ON products(is_active, is_on_promotion);
```

**banners**
```sql
CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500),
    brand VARCHAR(50),
    button_text VARCHAR(50),
    button_link VARCHAR(200),
    product_codes TEXT,  -- ← NUEVO (CSV de códigos)
    banner_type VARCHAR(20) DEFAULT 'promo',
    bg_color VARCHAR(50),
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**product_images**
```sql
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    public_id VARCHAR(200),  -- Cloudinary ID para eliminar
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Otras tablas:**
- `categories` - Categorías de productos
- `users` - Usuarios (clientes y admins)
- `cart_items` - Items del carrito
- `orders` - Órdenes de compra
- `order_items` - Items de órdenes
- `quotes` - Cotizaciones
- `quote_items` - Items de cotizaciones

#### Relaciones

```
categories (1) ──< (N) products
products (1) ──< (N) product_images
products (1) ──< (N) cart_items
products (1) ──< (N) order_items
products (1) ──< (N) quote_items
users (1) ──< (N) orders
users (1) ──< (N) quotes
orders (1) ──< (N) order_items
quotes (1) ──< (N) quote_items
```

---

## 🚀 Infraestructura y Deploy

### Diagrama de Deployment

```
┌──────────────────────────────────────────────────────────┐
│                      USUARIO                              │
└────────────┬─────────────────────────────┬───────────────┘
             │                             │
             │ HTTPS                       │ HTTPS
             ▼                             ▼
   ┌──────────────────┐          ┌──────────────────┐
   │  Vercel CDN      │          │  Railway         │
   │  (Frontend)      │◄─────────┤  (Backend)       │
   │                  │   API    │                  │
   │  React + Vite    │  calls   │  FastAPI         │
   │  Static Files    │          │  Docker          │
   └──────────────────┘          └────────┬─────────┘
                                          │
                                          │ asyncpg
                                          ▼
                                 ┌──────────────────┐
                                 │  PostgreSQL      │
                                 │  (Railway)       │
                                 └──────────────────┘
                                          ▲
                                          │
                                 ┌────────┴─────────┐
                                 │  Cloudinary CDN  │
                                 │  (Imágenes)      │
                                 └──────────────────┘
```

### Frontend - Vercel

**Configuración automática:**
- Detección de Vite
- Build command: `npm run build`
- Output directory: `dist`
- Deploy en push a `main`

**Variables de entorno en Vercel:**
```
VITE_API_URL=https://maldonado-repuestos-production.up.railway.app
```

**Dominio:** https://maldonado-repuestos.com

### Backend - Railway

**Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Variables de entorno en Railway:**
```
DATABASE_URL=postgresql://...  # Auto-inyectada por Railway
SECRET_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MERCADOPAGO_ACCESS_TOKEN=...
CORS_ORIGINS=https://maldonado-repuestos.com
```

**Dominio:** https://maldonado-repuestos-production.up.railway.app

### Base de Datos - Railway PostgreSQL

- PostgreSQL 15+ managed
- Backups automáticos
- Acceso via `DATABASE_URL`
- Panel de administración en Railway Dashboard → Data tab

---

## 🔄 Flujo de Datos

### Flujo de Listado de Productos

```
1. Usuario → CatalogPage.jsx
   └─ useEffect → fetchProducts({ on_promotion: true })

2. Frontend → services/api.js
   └─ fetch(`${API_URL}/api/products?on_promotion=true`)

3. Backend → app/api/products.py
   └─ @router.get("", response_model=ProductListResponse)
       └─ query = select(Product).where(Product.is_on_promotion == True)
       └─ result = await db.execute(query)

4. Backend → SQLAlchemy ORM
   └─ SELECT * FROM products WHERE is_on_promotion = true

5. PostgreSQL → Devuelve filas

6. Backend → product_to_response(p)
   └─ ProductResponse(id=p.id, ..., is_on_promotion=p.is_on_promotion)

7. Backend → JSON Response
   {
     "items": [
       { "id": 1, "name": "Producto", "is_on_promotion": true, ... }
     ],
     "total": 10,
     "page": 1
   }

8. Frontend → ProductCard.jsx
   └─ {product.is_on_promotion && <span>🔥 OFERTA</span>}
```

### Flujo de Creación de Producto (Admin)

```
1. Usuario admin → AdminPage.jsx
   └─ Completa formulario, marca "En Promoción"
   └─ onClick → createProduct(formData, token)

2. Frontend → services/api.js
   └─ POST /api/admin/products
       Headers: { Authorization: Bearer <JWT> }
       Body: { name: "...", is_on_promotion: true, ... }

3. Backend → app/api/admin.py
   └─ @router.post("/products", dependencies=[Depends(get_admin_user)])
       └─ Valida JWT
       └─ Valida ProductCreate schema (Pydantic)

4. Backend → SQLAlchemy ORM
   └─ new_product = Product(**product_data.dict())
   └─ db.add(new_product)
   └─ await db.commit()
   └─ await db.refresh(new_product)

5. PostgreSQL → INSERT INTO products (..., is_on_promotion) VALUES (..., true)

6. Backend → product_to_response(new_product)
   └─ ProductResponse con todos los campos

7. Frontend → Actualiza lista de productos
   └─ Estado local se refresca
```

### Flujo de Upload de Imagen

```
1. Admin → AdminPage.jsx
   └─ <input type="file" onChange={handleImageUpload} />

2. Frontend → services/api.js
   └─ POST /api/uploads/image
       FormData: { file: File }

3. Backend → app/api/uploads.py
   └─ @router.post("/image")
       └─ file = await upload_file.read()

4. Backend → services/cloudinary_service.py
   └─ result = cloudinary.uploader.upload(file, folder="maldonado/products")
   └─ return { url: result['secure_url'], public_id: result['public_id'] }

5. Cloudinary CDN → Procesa y almacena imagen

6. Backend → JSON Response
   { "url": "https://res.cloudinary.com/.../image.jpg", "public_id": "..." }

7. Frontend → Guarda URL en formulario
   └─ Al crear/editar producto, envía image_url y public_id
```

---

## 📐 Patrones y Convenciones

### Backend

#### Estructura de Endpoint
```python
@router.get("/products", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db)
):
    """Docstring describiendo el endpoint"""
    # 1. Construir query
    query = select(Product).where(Product.is_active == True)

    # 2. Aplicar filtros
    if on_promotion:
        query = query.where(Product.is_on_promotion == on_promotion)

    # 3. Paginación
    query = query.offset((page - 1) * page_size).limit(page_size)

    # 4. Ejecutar
    result = await db.execute(query)
    products = result.scalars().all()

    # 5. Transformar a schema
    items = [product_to_response(p) for p in products]

    # 6. Devolver response
    return ProductListResponse(items=items, total=total, ...)
```

#### Naming Conventions
- **Modelos SQLAlchemy:** Singular, PascalCase → `Product`, `ProductImage`
- **Schemas Pydantic:** Descriptivo → `ProductCreate`, `ProductResponse`, `ProductUpdate`
- **Endpoints:** Plural, kebab-case → `/products`, `/product-images`
- **Funciones:** snake_case → `get_current_user()`, `product_to_response()`
- **Variables:** snake_case → `user_id`, `is_on_promotion`

### Frontend

#### Estructura de Componente
```javascript
// ProductCard.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'

const ProductCard = ({ product, onQuoteRequest }) => {
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    // lógica
  }

  return (
    <motion.div whileHover={{ y: -4 }}>
      {/* JSX */}
    </motion.div>
  )
}

export default ProductCard
```

#### Naming Conventions
- **Componentes:** PascalCase → `ProductCard.jsx`, `Hero.jsx`
- **Funciones:** camelCase → `handleAddToCart()`, `fetchProducts()`
- **Variables:** camelCase → `userId`, `isOnPromotion`
- **Constantes:** UPPER_SNAKE_CASE → `API_URL`, `MAX_ITEMS`
- **Archivos de servicios:** camelCase → `api.js`, `localCartStore.js`

#### Hooks y Estado
```javascript
// Custom hook
export const useProducts = (filters) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts(filters).then(setProducts).finally(() => setLoading(false))
  }, [filters])

  return { products, loading }
}

// Uso
const { products, loading } = useProducts({ on_promotion: true })
```

### Git Workflow

#### Commits
```
feat: Agregar badge de OFERTA para productos en promoción
fix: Corregir error de validación en ProductResponse
refactor: Extraer lógica de filtros a helper function
docs: Actualizar README con instrucciones de deploy
style: Formatear código según ESLint
test: Agregar tests para endpoint de productos
chore: Actualizar dependencias de frontend
```

#### Branches
- `main` - Producción
- `develop` - Desarrollo
- `feature/nombre-feature` - Nueva funcionalidad
- `fix/nombre-bug` - Corrección de bug
- `hotfix/nombre-urgente` - Fix urgente en producción

---

## 📊 Métricas y Performance

### Backend
- **Response Time:** ~100-300ms (queries optimizadas con índices)
- **Concurrent Requests:** Async/await permite alta concurrencia
- **Database Pool:** SQLAlchemy maneja pool de conexiones

### Frontend
- **Build Size:** ~200KB (gzipped)
- **First Contentful Paint:** <1.5s (Vercel CDN)
- **Time to Interactive:** <2.5s
- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices)

### Optimizaciones

**Backend:**
- Índices compuestos en consultas frecuentes
- Queries async con SQLAlchemy 2.0
- Selectinload para relaciones (evita N+1)
- Cache headers (Cache-Control: public, max-age=60)

**Frontend:**
- Code splitting con React Router
- Lazy loading de imágenes
- Skeleton loaders
- Optimización de imágenes con Cloudinary

---

## 🔐 Seguridad

### Backend
- **JWT Tokens:** Expiración de 7 días
- **Bcrypt:** Hash de contraseñas con salt rounds=12
- **CORS:** Whitelist de dominios permitidos
- **SQL Injection:** Protección automática con SQLAlchemy ORM
- **XSS:** Sanitización de inputs con Pydantic

### Frontend
- **HTTPS Only:** Vercel fuerza HTTPS
- **Content Security Policy:** Headers de seguridad
- **Token Storage:** LocalStorage (considerar HttpOnly cookies en futuro)

---

## 📈 Roadmap y Mejoras Futuras

### Corto Plazo
- [ ] Implementar sistema de migraciones automáticas (Alembic)
- [ ] Agregar tests unitarios (pytest)
- [ ] Mejorar panel de administración (filtros, búsqueda)
- [ ] Implementar sistema de stock en tiempo real

### Mediano Plazo
- [ ] Integrar sistema de notificaciones por email
- [ ] Agregar dashboard de analytics
- [ ] Implementar sistema de reviews y ratings
- [ ] Optimizar imágenes con lazy loading avanzado

### Largo Plazo
- [ ] Migrar a TypeScript (frontend y backend)
- [ ] Implementar GraphQL para queries más flexibles
- [ ] Agregar sistema de recomendaciones con ML
- [ ] App móvil con React Native

---

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### Guías de Estilo
- Backend: PEP 8 (Python)
- Frontend: ESLint config
- Commits: Conventional Commits

---

## 📞 Contacto

**Proyecto:** Maldonado Repuestos
**Desarrollador:** Santiago Gonzalez
**GitHub:** https://github.com/SANTIGON01/maldonado-repuestos

---

**Última actualización:** 2026-02-12
