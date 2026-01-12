"""
Seed script to populate initial data
Run: python seed_data.py
"""
import asyncio
from decimal import Decimal
from app.database import AsyncSessionLocal, create_tables
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product
from app.utils.security import get_password_hash


async def seed():
    """Populate database with initial data"""
    await create_tables()
    
    async with AsyncSessionLocal() as db:
        # Check if data exists
        from sqlalchemy import select
        result = await db.execute(select(User))
        if result.scalar_one_or_none():
            print("Database already seeded!")
            return
        
        print("Seeding database...")
        
        # Create admin user
        admin = User(
            email="admin@maldonadorepuestos.com",
            password_hash=get_password_hash("admin123"),
            name="Administrador",
            phone="+54 11 1234-5678",
            role=UserRole.ADMIN,
        )
        db.add(admin)
        
        # Create test user
        user = User(
            email="cliente@test.com",
            password_hash=get_password_hash("cliente123"),
            name="Cliente Test",
            phone="+54 11 9876-5432",
            role=UserRole.USER,
        )
        db.add(user)
        
        # Create categories
        categories_data = [
            {"name": "Ejes y Mazas", "slug": "ejes-mazas", "description": "Ejes, mazas, rodamientos y bujes", "icon": "CircleDot", "display_order": 1},
            {"name": "Sistema de Frenos", "slug": "frenos", "description": "Tambores, zapatas, pulmones, válvulas", "icon": "Disc", "display_order": 2},
            {"name": "Suspensión", "slug": "suspension", "description": "Elásticos, balancines, grilletes", "icon": "Waves", "display_order": 3},
            {"name": "Iluminación", "slug": "iluminacion", "description": "Faros, balizas, fichas, cables", "icon": "Lightbulb", "display_order": 4},
            {"name": "Lonas y Carpas", "slug": "lonas-carpas", "description": "Lonas, herrajes, tensores, sogas", "icon": "Shield", "display_order": 5},
            {"name": "Accesorios", "slug": "accesorios", "description": "King pin, patas, guardabarros", "icon": "Settings", "display_order": 6},
        ]
        
        categories = {}
        for cat_data in categories_data:
            cat = Category(**cat_data)
            db.add(cat)
            categories[cat_data["slug"]] = cat
        
        await db.flush()  # Get category IDs
        
        # Create products
        products_data = [
            # Ejes
            {"category_slug": "ejes-mazas", "name": "Eje BPW 9 Toneladas", "code": "BPW-090-TS", "brand": "BPW", "price": 850000, "original_price": 950000, "stock": 5, "is_new": True, "is_featured": True, "rating": 4.9},
            {"category_slug": "ejes-mazas", "name": "Maza Completa 10 Agujeros", "code": "MZA-10A-420", "brand": "MERITOR", "price": 125000, "stock": 12, "is_featured": True, "rating": 4.8},
            {"category_slug": "ejes-mazas", "name": "Rodamiento Rueda Trasera", "code": "ROD-RT-32310", "brand": "SKF", "price": 45000, "stock": 25, "rating": 4.7},
            
            # Frenos
            {"category_slug": "frenos", "name": "Tambor de Freno 10 Agujeros", "code": "MER-TB10-420", "brand": "MERITOR", "price": 185000, "stock": 8, "is_featured": True, "rating": 4.8},
            {"category_slug": "frenos", "name": "Pulmón de Freno Simple", "code": "WAB-PS-24", "brand": "WABCO", "price": 45000, "original_price": 52000, "stock": 20, "rating": 4.7},
            {"category_slug": "frenos", "name": "Zapata de Freno Completa", "code": "ZAP-FR-420", "brand": "FRAS-LE", "price": 35000, "stock": 30, "rating": 4.6},
            {"category_slug": "frenos", "name": "Válvula Relay", "code": "HAL-VR-90", "brand": "HALDEX", "price": 65000, "stock": 15, "is_new": True, "rating": 4.8},
            
            # Suspensión
            {"category_slug": "suspension", "name": "Elástico Trasero 12 Hojas", "code": "RAN-EL12-90", "brand": "RANDON", "price": 320000, "stock": 4, "is_new": True, "is_featured": True, "rating": 4.9},
            {"category_slug": "suspension", "name": "Balancín Completo", "code": "BAL-CM-180", "brand": "FRUEHAUF", "price": 95000, "stock": 10, "rating": 4.5},
            {"category_slug": "suspension", "name": "Válvula Niveladora", "code": "HAL-VN-90", "brand": "HALDEX", "price": 78000, "stock": 18, "is_featured": True, "rating": 4.7},
            {"category_slug": "suspension", "name": "Grillete de Elástico", "code": "GRI-EL-25", "brand": "RANDON", "price": 8500, "stock": 50, "rating": 4.4},
            
            # Iluminación
            {"category_slug": "iluminacion", "name": "Faro Trasero LED Completo", "code": "HEL-FT-LED", "brand": "HELLA", "price": 28500, "stock": 25, "is_new": True, "is_featured": True, "rating": 4.9},
            {"category_slug": "iluminacion", "name": "Baliza LED Ámbar", "code": "BAL-LED-AM", "brand": "HELLA", "price": 12500, "stock": 40, "rating": 4.6},
            {"category_slug": "iluminacion", "name": "Ficha 7 Vías", "code": "FIC-7V-STD", "brand": "GENERIC", "price": 3500, "stock": 100, "rating": 4.3},
            
            # Accesorios
            {"category_slug": "accesorios", "name": "King Pin 2\" x 3.5\"", "code": "JOS-KP-235", "brand": "JOST", "price": 125000, "original_price": 145000, "stock": 6, "is_featured": True, "rating": 4.8},
            {"category_slug": "accesorios", "name": "Pata de Apoyo Manual", "code": "SAF-PA-28", "brand": "SAF", "price": 195000, "original_price": 220000, "stock": 0, "rating": 4.6},
            {"category_slug": "accesorios", "name": "Guardabarro Plástico", "code": "GUA-PL-600", "brand": "GENERIC", "price": 18500, "stock": 30, "rating": 4.2},
            {"category_slug": "accesorios", "name": "Gancho de Cadena", "code": "GAN-CAD-10", "brand": "CROSBY", "price": 8500, "stock": 45, "rating": 4.5},
            
            # Lonas
            {"category_slug": "lonas-carpas", "name": "Lona 900gr/m2 (metro)", "code": "LON-900-MT", "brand": "SANSUY", "price": 4500, "stock": 200, "rating": 4.4},
            {"category_slug": "lonas-carpas", "name": "Tensor de Lona", "code": "TEN-LON-50", "brand": "GENERIC", "price": 2500, "stock": 80, "rating": 4.3},
        ]
        
        for prod_data in products_data:
            cat_slug = prod_data.pop("category_slug")
            category = categories[cat_slug]
            
            product = Product(
                category_id=category.id,
                description=f"Repuesto de alta calidad marca {prod_data['brand']}. Garantía oficial.",
                reviews_count=50,
                **{k: Decimal(str(v)) if k in ["price", "original_price", "rating"] else v 
                   for k, v in prod_data.items()}
            )
            db.add(product)
        
        await db.commit()
        print("Database seeded successfully!")
        print("\nCredenciales de prueba:")
        print("  Admin: admin@maldonadorepuestos.com / admin123")
        print("  Cliente: cliente@test.com / cliente123")


if __name__ == "__main__":
    asyncio.run(seed())

