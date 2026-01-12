"""
Script para inicializar la base de datos PostgreSQL
"""
import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.database import engine, AsyncSessionLocal, Base
from app.models import *  # Importar todos los modelos


async def init_database():
    """Crear todas las tablas en PostgreSQL"""
    print("=" * 50)
    print("INICIALIZACIÓN DE BASE DE DATOS POSTGRESQL")
    print("=" * 50)
    
    # Crear todas las tablas
    print("\n[1] Creando tablas...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("    ✓ Tablas creadas exitosamente")
    
    # Verificar conexión
    print("\n[2] Verificando conexión...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT 1"))
        print("    ✓ Conexión a PostgreSQL OK")
        
        # Contar registros en tablas principales
        print("\n[3] Estado de las tablas:")
        
        tables = [
            ("users", "Usuarios"),
            ("categories", "Categorías"),
            ("products", "Productos"),
            ("product_images", "Imágenes de Producto"),
            ("banners", "Banners"),
            ("quotes", "Cotizaciones"),
        ]
        
        for table_name, label in tables:
            try:
                result = await session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar()
                print(f"    • {label}: {count} registros")
            except Exception as e:
                print(f"    • {label}: Tabla no existe o error")
    
    print("\n" + "=" * 50)
    print("✓ INICIALIZACIÓN COMPLETADA")
    print("=" * 50)
    print("\nSi las tablas están vacías, ejecuta: python seed_data.py")


if __name__ == "__main__":
    asyncio.run(init_database())
