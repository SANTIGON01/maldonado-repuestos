"""Agregar columna brand a banners"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def add_column():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE banners ADD COLUMN brand VARCHAR(50)"))
            print("[OK] Columna 'brand' agregada a banners")
        except Exception as e:
            print(f"[INFO] {e}")

if __name__ == "__main__":
    asyncio.run(add_column())
