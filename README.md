# 🔧 Maldonado Repuestos - E-commerce

E-commerce B2B para repuestos automotrices e industriales.

## 🎨 Identidad Visual

| Elemento | Color | Código |
|----------|-------|--------|
| **Primario (Rojo)** | Rojo carmesí | `#B91C1C` |
| **Secundario (Gris Oscuro)** | Gris carbón | `#1F2937` |
| **Acento (Chrome)** | Gris metálico | `#9CA3AF` |

## 📁 Estructura del Proyecto

```
├── frontend/           # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── store/       # Estado con Zustand
│   │   └── App.jsx
│   └── tailwind.config.js
│
└── backend/            # Python + FastAPI
    ├── app/
    │   ├── api/         # Endpoints
    │   ├── models/      # SQLAlchemy models
    │   ├── schemas/     # Pydantic schemas
    │   └── main.py
    └── requirements.txt
```

## 🚀 Comenzar

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acceder a: http://localhost:3000

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Acceder a: http://localhost:8000/docs (Swagger UI)

## ✨ Características

- ✅ Landing page con diseño industrial profesional
- ✅ Paleta de colores basada en el logo (Rojo + Gris metálico)
- ✅ Catálogo de productos con cards
- ✅ Secciones: Hero, Categorías, Productos, Features, CTA, Footer
- ✅ Diseño responsive (mobile-first)
- ✅ Animaciones y microinteracciones
- 🔄 Carrito de compras (Zustand) - Próximamente
- 🔄 Backend con FastAPI - Próximamente
- 🔄 Base de datos PostgreSQL - Próximamente

## 📦 Stack Tecnológico

**Frontend:**
- React 18 + Vite
- Tailwind CSS (colores personalizados)
- Lucide React (iconos)
- Zustand (estado)

**Backend:**
- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 (Async)
- Pydantic v2

## 🖼️ Screenshots

*Próximamente*

---

Desarrollado con ❤️ para **Maldonado Repuestos**

