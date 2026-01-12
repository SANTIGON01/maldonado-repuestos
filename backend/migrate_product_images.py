"""
Migration script para crear la tabla product_images
"""
import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.database import engine, AsyncSessionLocal


async def migrate():
    """Crear tabla product_images"""
    print("=== Migración: Tabla product_images ===\n")
    
    async with engine.begin() as conn:
        # Verificar si la tabla ya existe
        result = await conn.execute(text(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='product_images'"
        ))
        exists = result.fetchone() is not None
        
        if exists:
            print("✓ La tabla product_images ya existe")
        else:
            # Crear tabla
            await conn.execute(text("""
                CREATE TABLE product_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER NOT NULL,
                    image_url VARCHAR(500) NOT NULL,
                    display_order INTEGER DEFAULT 0 NOT NULL,
                    is_primary BOOLEAN DEFAULT 0 NOT NULL,
                    alt_text VARCHAR(200),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                )
            """))
            print("✓ Tabla product_images creada")
            
            # Crear índice
            await conn.execute(text(
                "CREATE INDEX ix_product_images_product_id ON product_images(product_id)"
            ))
            print("✓ Índice creado")
    
    # Migrar imágenes existentes (si hay productos con image_url)
    async with AsyncSessionLocal() as session:
        result = await session.execute(text(
            "SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND image_url != ''"
        ))
        products_with_images = result.fetchall()
        
        if products_with_images:
            print(f"\nMigrando {len(products_with_images)} imágenes existentes...")
            for product_id, image_url in products_with_images:
                # Verificar si ya existe
                check = await session.execute(text(
                    "SELECT id FROM product_images WHERE product_id = :pid AND image_url = :url"
                ), {"pid": product_id, "url": image_url})
                
                if not check.fetchone():
                    await session.execute(text("""
                        INSERT INTO product_images (product_id, image_url, display_order, is_primary)
                        VALUES (:pid, :url, 0, 1)
                    """), {"pid": product_id, "url": image_url})
                    print(f"  ✓ Producto {product_id}: imagen migrada")
            
            await session.commit()
            print("✓ Migración de imágenes completada")
        else:
            print("\nNo hay imágenes existentes para migrar")
    
    print("\n=== Migración completada ===")


if __name__ == "__main__":
    asyncio.run(migrate())
