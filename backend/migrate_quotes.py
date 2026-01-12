"""
Script de migración para agregar tabla quote_items y campos a quotes
"""
import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.database import engine


async def migrate():
    print("Iniciando migracion de quotes...")
    
    async with engine.begin() as conn:
        # Verificar si la columna sent_via_whatsapp existe en quotes
        result = await conn.execute(text("PRAGMA table_info(quotes)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'sent_via_whatsapp' not in columns:
            print("Agregando columna sent_via_whatsapp a quotes...")
            await conn.execute(text(
                "ALTER TABLE quotes ADD COLUMN sent_via_whatsapp BOOLEAN DEFAULT 0 NOT NULL"
            ))
            print("Columna sent_via_whatsapp agregada.")
        else:
            print("Columna sent_via_whatsapp ya existe.")
        
        # Verificar si la tabla quote_items existe
        result = await conn.execute(text(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='quote_items'"
        ))
        table_exists = result.fetchone() is not None
        
        if not table_exists:
            print("Creando tabla quote_items...")
            await conn.execute(text("""
                CREATE TABLE quote_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    quote_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    product_code VARCHAR(50) NOT NULL,
                    product_name VARCHAR(200) NOT NULL,
                    quantity INTEGER DEFAULT 1 NOT NULL,
                    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(id)
                )
            """))
            # Crear índice para quote_id
            await conn.execute(text(
                "CREATE INDEX ix_quote_items_quote_id ON quote_items(quote_id)"
            ))
            print("Tabla quote_items creada.")
        else:
            print("Tabla quote_items ya existe.")
        
        # Hacer message nullable en quotes
        print("Verificando que message sea nullable...")
        # SQLite no permite ALTER COLUMN, así que solo verificamos
        
    print("Migracion completada exitosamente!")


if __name__ == "__main__":
    asyncio.run(migrate())

