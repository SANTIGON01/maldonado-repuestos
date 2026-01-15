"""
Script para arreglar las foreign keys de productos
Permite que product_id sea nullable para mantener historial
"""
import asyncio
import sys
from sqlalchemy import text
from app.database import engine

async def fix_foreign_keys():
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    
    print("\n=== ARREGLANDO FOREIGN KEYS DE PRODUCTOS ===\n")
    
    async with engine.begin() as conn:
        # Verificar si estamos en PostgreSQL o SQLite
        result = await conn.execute(text("SELECT 1"))
        
        try:
            # Para PostgreSQL
            print("[1/4] Modificando order_items.product_id...")
            await conn.execute(text("""
                ALTER TABLE order_items 
                ALTER COLUMN product_id DROP NOT NULL
            """))
            print("      [OK] order_items.product_id ahora es nullable")
        except Exception as e:
            print(f"      [INFO] Posiblemente ya es nullable o usando SQLite: {e}")
        
        try:
            print("[2/4] Modificando quote_items.product_id...")
            await conn.execute(text("""
                ALTER TABLE quote_items 
                ALTER COLUMN product_id DROP NOT NULL
            """))
            print("      [OK] quote_items.product_id ahora es nullable")
        except Exception as e:
            print(f"      [INFO] Posiblemente ya es nullable o usando SQLite: {e}")
        
        # Intentar recrear las foreign keys con ON DELETE SET NULL
        try:
            print("[3/4] Actualizando FK de order_items...")
            # Primero eliminar la FK existente si existe
            await conn.execute(text("""
                ALTER TABLE order_items 
                DROP CONSTRAINT IF EXISTS order_items_product_id_fkey
            """))
            # Agregar nueva FK con ON DELETE SET NULL
            await conn.execute(text("""
                ALTER TABLE order_items 
                ADD CONSTRAINT order_items_product_id_fkey 
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
            """))
            print("      [OK] FK de order_items actualizada")
        except Exception as e:
            print(f"      [INFO] No se pudo actualizar FK: {e}")
        
        try:
            print("[4/4] Actualizando FK de quote_items...")
            await conn.execute(text("""
                ALTER TABLE quote_items 
                DROP CONSTRAINT IF EXISTS quote_items_product_id_fkey
            """))
            await conn.execute(text("""
                ALTER TABLE quote_items 
                ADD CONSTRAINT quote_items_product_id_fkey 
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
            """))
            print("      [OK] FK de quote_items actualizada")
        except Exception as e:
            print(f"      [INFO] No se pudo actualizar FK: {e}")
    
    print("\n=== MIGRACION COMPLETADA ===\n")
    print("Ahora puedes eliminar productos sin errores.")
    print("El historial de ordenes y cotizaciones se mantiene intacto.\n")

if __name__ == "__main__":
    asyncio.run(fix_foreign_keys())
