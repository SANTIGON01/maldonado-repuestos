"""
API Routes
"""
from fastapi import APIRouter
from app.api import auth, products, categories, cart, orders, quotes, payments, admin, banners

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categorías"])
api_router.include_router(products.router, prefix="/products", tags=["Productos"])
api_router.include_router(cart.router, prefix="/cart", tags=["Carrito"])
api_router.include_router(orders.router, prefix="/orders", tags=["Pedidos"])
api_router.include_router(quotes.router, prefix="/quotes", tags=["Cotizaciones"])
api_router.include_router(payments.router, prefix="/payments", tags=["Pagos"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administración"])
api_router.include_router(banners.router, tags=["Banners"])

