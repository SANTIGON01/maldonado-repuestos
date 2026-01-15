"""
Script para actualizar las categorias:
- Eliminar "Lonas y Carpas"
- Agregar "Buloneria y Conexiones"
- Agregar "Herramientas"

Run: python update_categories.py
"""
import asyncio
import sys
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal
from app.models.category import Category
from app.models.product import Product

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')


async def update_categories():
    """Actualizar categorias de la base de datos"""
    
    async with AsyncSessionLocal() as db:
        print("=== ACTUALIZANDO CATEGORIAS ===\n")
        
        # 1. Eliminar categoría "Lonas y Carpas" y sus productos
        result = await db.execute(
            select(Category).where(Category.slug == "lonas-carpas")
        )
        lonas_cat = result.scalar_one_or_none()
        
        if lonas_cat:
            # Eliminar productos de esa categoría
            await db.execute(
                delete(Product).where(Product.category_id == lonas_cat.id)
            )
            print("[OK] Productos de 'Lonas y Carpas' eliminados")
            
            # Eliminar la categoría
            await db.delete(lonas_cat)
            print("[OK] Categoria 'Lonas y Carpas' eliminada")
        else:
            print("[-] Categoria 'Lonas y Carpas' no existe")
        
        # 2. Agregar nuevas categorías si no existen
        new_categories = [
            {
                "name": "Bulonería y Conexiones", 
                "slug": "buloneria-conexiones", 
                "description": "Bulones, tuercas, arandelas, conexiones neumáticas e hidráulicas", 
                "icon": "Cog", 
                "display_order": 5
            },
            {
                "name": "Herramientas", 
                "slug": "herramientas", 
                "description": "Herramientas especiales para semirremolques y acoplados", 
                "icon": "Wrench", 
                "display_order": 6
            },
        ]
        
        for cat_data in new_categories:
            # Verificar si ya existe
            result = await db.execute(
                select(Category).where(Category.slug == cat_data["slug"])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                print(f"[-] Categoria '{cat_data['name']}' ya existe")
            else:
                new_cat = Category(**cat_data)
                db.add(new_cat)
                print(f"[OK] Categoria '{cat_data['name']}' creada")
        
        # 3. Actualizar display_order de Accesorios
        result = await db.execute(
            select(Category).where(Category.slug == "accesorios")
        )
        accesorios = result.scalar_one_or_none()
        if accesorios:
            accesorios.display_order = 7
            print("[OK] Orden de 'Accesorios' actualizado a 7")
        
        await db.commit()
        
        # Mostrar categorías actuales
        print("\n=== CATEGORÍAS ACTUALES ===")
        result = await db.execute(
            select(Category).order_by(Category.display_order)
        )
        categories = result.scalars().all()
        
        for cat in categories:
            print(f"  {cat.display_order}. {cat.name} ({cat.slug}) - Icono: {cat.icon}")
        
        print("\n¡Actualización completada!")


if __name__ == "__main__":
    asyncio.run(update_categories())
