"""Verificar banners"""
import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("SELECT id, title, brand FROM banners"))
        print("\n=== BANNERS ===")
        for row in result.fetchall():
            print(f"ID: {row[0]}, Title: {row[1]}, Brand: {row[2]}")
        print()

if __name__ == "__main__":
    asyncio.run(check())
