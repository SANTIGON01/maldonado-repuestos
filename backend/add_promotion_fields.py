"""Agregar campos de promoción a products y banners"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def add_promotion_fields():
    async with engine.begin() as conn:
        # Agregar is_on_promotion a products
        await conn.execute(text("""
            ALTER TABLE products
            ADD COLUMN is_on_promotion BOOLEAN DEFAULT FALSE NOT NULL
        """))

        # Agregar índice para optimizar queries
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_products_active_on_promotion
            ON products(is_active, is_on_promotion)
        """))

        # Agregar product_codes a banners
        await conn.execute(text("""
            ALTER TABLE banners
            ADD COLUMN product_codes TEXT
        """))

        print("[OK] Campos agregados exitosamente:")
        print("   - products.is_on_promotion (BOOLEAN)")
        print("   - Indice ix_products_active_on_promotion")
        print("   - banners.product_codes (TEXT)")

if __name__ == "__main__":
    asyncio.run(add_promotion_fields())
