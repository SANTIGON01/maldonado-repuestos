"""Actualizar brand del banner"""
import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def update():
    async with AsyncSessionLocal() as db:
        # Actualizar el banner de JOST
        await db.execute(text("UPDATE banners SET brand = 'JOST' WHERE id = 1"))
        await db.commit()
        print("[OK] Banner 1 actualizado con brand = JOST")
        
        # Verificar
        result = await db.execute(text("SELECT id, title, brand FROM banners WHERE id = 1"))
        row = result.fetchone()
        print(f"Verificación: ID={row[0]}, Title={row[1]}, Brand={row[2]}")

if __name__ == "__main__":
    asyncio.run(update())
