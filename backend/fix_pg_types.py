"""
Script para arreglar tipos de columnas en PostgreSQL
Corrige columnas que deberían ser NUMERIC pero están como TEXT
"""
import asyncio
import sys
from sqlalchemy import text
from app.database import engine

async def fix_column_types():
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    
    print("\n=== ARREGLANDO TIPOS DE COLUMNAS EN POSTGRESQL ===\n")
    
    async with engine.begin() as conn:
        # Verificar y arreglar columnas en order_items
        try:
            print("[1/6] Arreglando order_items.unit_price...")
            await conn.execute(text("""
                ALTER TABLE order_items 
                ALTER COLUMN unit_price TYPE NUMERIC(12,2) USING unit_price::NUMERIC(12,2)
            """))
            print("      [OK]")
        except Exception as e:
            print(f"      [INFO] {e}")
        
        try:
            print("[2/6] Arreglando order_items.total_price...")
            await conn.execute(text("""
                ALTER TABLE order_items 
                ALTER COLUMN total_price TYPE NUMERIC(12,2) USING total_price::NUMERIC(12,2)
            """))
            print("      [OK]")
        except Exception as e:
            print(f"      [INFO] {e}")
        
        try:
            print("[3/6] Arreglando order_items.quantity...")
            await conn.execute(text("""
                ALTER TABLE order_items 
                ALTER COLUMN quantity TYPE INTEGER USING quantity::INTEGER
            """))
            print("      [OK]")
        except Exception as e:
            print(f"      [INFO] {e}")
        
        # Verificar y arreglar columnas en quote_items
        try:
            print("[4/6] Arreglando quote_items.quantity...")
            await conn.execute(text("""
                ALTER TABLE quote_items 
                ALTER COLUMN quantity TYPE INTEGER USING quantity::INTEGER
            """))
            print("      [OK]")
        except Exception as e:
            print(f"      [INFO] {e}")
        
        # Verificar y arreglar columnas en cart_items
        try:
            print("[5/6] Arreglando cart_items.quantity...")
            await conn.execute(text("""
                ALTER TABLE cart_items 
                ALTER COLUMN quantity TYPE INTEGER USING quantity::INTEGER
            """))
            print("      [OK]")
        except Exception as e:
            print(f"      [INFO] {e}")
        
        # Verificar columnas de products
        try:
            print("[6/6] Verificando products.stock...")
            await conn.execute(text("""
                ALTER TABLE products 
                ALTER COLUMN stock TYPE INTEGER USING stock::INTEGER
            """))
            print("      [OK]")
        except Exception as e:
            print(f"      [INFO] {e}")
    
    print("\n=== TIPOS DE COLUMNAS ARREGLADOS ===\n")

if __name__ == "__main__":
    asyncio.run(fix_column_types())
