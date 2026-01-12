"""
Script para verificar tablas en PostgreSQL
"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def check_tables():
    async with engine.connect() as conn:
        # Listar tablas
        result = await conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        ))
        tables = [row[0] for row in result.fetchall()]
        print('Tablas encontradas:', tables)
        
        # Verificar product_images
        if 'product_images' in tables:
            cols = await conn.execute(text(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_images'"
            ))
            print('\nColumnas de product_images:')
            for row in cols.fetchall():
                print(f'  - {row[0]}: {row[1]}')
        else:
            print('\n¡TABLA product_images NO EXISTE!')
            print('Creando tabla...')
            
            # Crear la tabla
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS product_images (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    image_url VARCHAR(500) NOT NULL,
                    display_order INTEGER DEFAULT 0 NOT NULL,
                    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
                    alt_text VARCHAR(200),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
                )
            """))
            await conn.commit()
            print('Tabla product_images creada!')

if __name__ == '__main__':
    asyncio.run(check_tables())
