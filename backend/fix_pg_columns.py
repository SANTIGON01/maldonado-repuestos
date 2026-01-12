"""
Script para corregir los tipos de columnas en PostgreSQL
"""
import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.database import AsyncSessionLocal


async def fix_columns():
    """Corregir tipos de columnas TEXT a NUMERIC"""
    print("=" * 50)
    print("CORRIGIENDO TIPOS DE COLUMNAS EN POSTGRESQL")
    print("=" * 50)
    
    async with AsyncSessionLocal() as session:
        try:
            # Corregir price
            print("\n[1] Corrigiendo columna 'price'...")
            await session.execute(text("""
                ALTER TABLE products 
                ALTER COLUMN price TYPE NUMERIC(12,2) 
                USING COALESCE(NULLIF(price, '')::NUMERIC(12,2), 0)
            """))
            print("    ✓ price corregido")
            
            # Corregir original_price  
            print("\n[2] Corrigiendo columna 'original_price'...")
            await session.execute(text("""
                ALTER TABLE products 
                ALTER COLUMN original_price TYPE NUMERIC(12,2) 
                USING NULLIF(original_price, '')::NUMERIC(12,2)
            """))
            print("    ✓ original_price corregido")
            
            # Corregir rating
            print("\n[3] Corrigiendo columna 'rating'...")
            await session.execute(text("""
                ALTER TABLE products 
                ALTER COLUMN rating TYPE NUMERIC(2,1) 
                USING COALESCE(NULLIF(rating, '')::NUMERIC(2,1), 0)
            """))
            print("    ✓ rating corregido")
            
            await session.commit()
            
            print("\n" + "=" * 50)
            print("✓ CORRECCIÓN COMPLETADA")
            print("=" * 50)
            
        except Exception as e:
            print(f"\n✗ Error: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(fix_columns())
