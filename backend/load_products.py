"""
Script para cargar productos con imágenes
Ejecutar: python load_products.py

Uso:
  python load_products.py           # Cargar productos de ejemplo
  python load_products.py --clear   # Limpiar y recargar
"""
import asyncio
import sys
from decimal import Decimal
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal, create_tables
from app.models.category import Category
from app.models.product import Product


# Categorías con iconos y descripciones
CATEGORIES = [
    {
        "name": "Ejes y Mazas",
        "slug": "ejes-mazas",
        "description": "Ejes completos, mazas, rodamientos y bujes para semirremolques",
        "icon": "CircleDot",
        "display_order": 1,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    },
    {
        "name": "Sistema de Frenos",
        "slug": "frenos",
        "description": "Tambores, zapatas, pulmones, válvulas y componentes de freno",
        "icon": "Disc",
        "display_order": 2,
        "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    },
    {
        "name": "Suspensión",
        "slug": "suspension",
        "description": "Elásticos, balancines, grilletes y válvulas niveladoras",
        "icon": "Waves",
        "display_order": 3,
        "image_url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
    },
    {
        "name": "Iluminación",
        "slug": "iluminacion",
        "description": "Faros LED, balizas, fichas eléctricas y cables",
        "icon": "Lightbulb",
        "display_order": 4,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400",
    },
    {
        "name": "Lonas y Carpas",
        "slug": "lonas-carpas",
        "description": "Lonas de alta resistencia, herrajes, tensores y accesorios",
        "icon": "Shield",
        "display_order": 5,
        "image_url": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400",
    },
    {
        "name": "Accesorios",
        "slug": "accesorios",
        "description": "King pin, patas de apoyo, guardabarros y más",
        "icon": "Settings",
        "display_order": 6,
        "image_url": "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400",
    },
]

# Productos con imágenes reales (usando Unsplash para demo)
PRODUCTS = [
    # ===== EJES Y MAZAS =====
    {
        "category_slug": "ejes-mazas",
        "name": "Eje BPW 9 Toneladas Completo",
        "code": "EJE-BPW-9T",
        "brand": "BPW",
        "description": "Eje BPW original de 9 toneladas. Incluye mazas, rodamientos y frenos de tambor. Ideal para semirremolques de carga pesada. Garantía de fábrica.",
        "price": Decimal("850000.00"),
        "original_price": Decimal("950000.00"),
        "stock": 5,
        "is_featured": True,
        "is_new": True,
        "rating": Decimal("4.9"),
        "reviews_count": 127,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
        "category_slug": "ejes-mazas",
        "name": "Maza Completa 10 Agujeros",
        "code": "MZA-10A-420",
        "brand": "MERITOR",
        "description": "Maza completa Meritor con 10 agujeros, diámetro 420mm. Compatible con ejes BPW, SAF y Fruehauf. Incluye rodamientos SKF.",
        "price": Decimal("125000.00"),
        "stock": 12,
        "is_featured": True,
        "rating": Decimal("4.8"),
        "reviews_count": 89,
        "image_url": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600",
    },
    {
        "category_slug": "ejes-mazas",
        "name": "Rodamiento Rueda SKF 32310",
        "code": "ROD-SKF-32310",
        "brand": "SKF",
        "description": "Rodamiento cónico SKF 32310 para rueda trasera. Alta durabilidad y resistencia. Original de Suecia.",
        "price": Decimal("45000.00"),
        "stock": 50,
        "rating": Decimal("4.7"),
        "reviews_count": 234,
        "image_url": "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=600",
    },
    {
        "category_slug": "ejes-mazas",
        "name": "Buje de Eje SAF Integral",
        "code": "BUJ-SAF-INT",
        "brand": "SAF",
        "description": "Buje integral para eje SAF. Material de alta resistencia. Fácil instalación.",
        "price": Decimal("35000.00"),
        "stock": 25,
        "rating": Decimal("4.5"),
        "reviews_count": 45,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    
    # ===== FRENOS =====
    {
        "category_slug": "frenos",
        "name": "Tambor de Freno Meritor 10 Agujeros",
        "code": "TAM-MER-10A",
        "brand": "MERITOR",
        "description": "Tambor de freno Meritor original, 10 agujeros, diámetro 420mm. Balanceado de fábrica. Máxima durabilidad.",
        "price": Decimal("185000.00"),
        "stock": 8,
        "is_featured": True,
        "rating": Decimal("4.8"),
        "reviews_count": 156,
        "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600",
    },
    {
        "category_slug": "frenos",
        "name": "Pulmón de Freno Simple Wabco",
        "code": "PUL-WAB-24S",
        "brand": "WABCO",
        "description": "Pulmón de freno simple Wabco tipo 24. Compatible con la mayoría de semirremolques. Diafragma reforzado.",
        "price": Decimal("45000.00"),
        "original_price": Decimal("52000.00"),
        "stock": 30,
        "rating": Decimal("4.7"),
        "reviews_count": 189,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
        "category_slug": "frenos",
        "name": "Zapata de Freno Fras-le Premium",
        "code": "ZAP-FRL-420",
        "brand": "FRAS-LE",
        "description": "Juego de zapatas Fras-le Premium. Material de fricción de alta performance. Larga duración y frenado seguro.",
        "price": Decimal("65000.00"),
        "stock": 40,
        "rating": Decimal("4.6"),
        "reviews_count": 278,
        "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600",
    },
    {
        "category_slug": "frenos",
        "name": "Válvula Relay Haldex",
        "code": "VAL-HAL-RLY",
        "brand": "HALDEX",
        "description": "Válvula relay Haldex para sistema neumático de frenos. Respuesta rápida y confiable.",
        "price": Decimal("78000.00"),
        "stock": 15,
        "is_new": True,
        "rating": Decimal("4.8"),
        "reviews_count": 67,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
        "category_slug": "frenos",
        "name": "Kit Reparación Pulmón T30",
        "code": "KIT-PUL-T30",
        "brand": "WABCO",
        "description": "Kit completo de reparación para pulmón tipo T30. Incluye diafragma, resorte y empaquetaduras.",
        "price": Decimal("18500.00"),
        "stock": 60,
        "rating": Decimal("4.4"),
        "reviews_count": 123,
        "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600",
    },
    
    # ===== SUSPENSIÓN =====
    {
        "category_slug": "suspension",
        "name": "Elástico Trasero Randon 12 Hojas",
        "code": "ELA-RAN-12H",
        "brand": "RANDON",
        "description": "Elástico trasero Randon de 12 hojas. Capacidad 9 toneladas por eje. Acero especial de alta resistencia.",
        "price": Decimal("320000.00"),
        "stock": 4,
        "is_featured": True,
        "is_new": True,
        "rating": Decimal("4.9"),
        "reviews_count": 98,
        "image_url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600",
    },
    {
        "category_slug": "suspension",
        "name": "Balancín Completo Fruehauf",
        "code": "BAL-FRU-180",
        "brand": "FRUEHAUF",
        "description": "Balancín completo Fruehauf 180mm. Incluye bujes de bronce y pasador. Listo para instalar.",
        "price": Decimal("95000.00"),
        "stock": 10,
        "rating": Decimal("4.5"),
        "reviews_count": 76,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
        "category_slug": "suspension",
        "name": "Válvula Niveladora Haldex",
        "code": "VAL-HAL-NIV",
        "brand": "HALDEX",
        "description": "Válvula niveladora Haldex para suspensión neumática. Mantiene altura constante del semirremolque.",
        "price": Decimal("78000.00"),
        "stock": 18,
        "is_featured": True,
        "rating": Decimal("4.7"),
        "reviews_count": 134,
        "image_url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600",
    },
    {
        "category_slug": "suspension",
        "name": "Grillete de Elástico Reforzado",
        "code": "GRI-REF-25",
        "brand": "RANDON",
        "description": "Grillete reforzado para elásticos de semirremolque. Pasador de 25mm. Tratamiento anticorrosivo.",
        "price": Decimal("8500.00"),
        "stock": 100,
        "rating": Decimal("4.4"),
        "reviews_count": 89,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    
    # ===== ILUMINACIÓN =====
    {
        "category_slug": "iluminacion",
        "name": "Faro Trasero LED Completo Hella",
        "code": "FAR-HEL-LED",
        "brand": "HELLA",
        "description": "Faro trasero LED Hella 3 funciones: posición, freno y giro. IP67, alta visibilidad. 12/24V.",
        "price": Decimal("28500.00"),
        "stock": 35,
        "is_featured": True,
        "is_new": True,
        "rating": Decimal("4.9"),
        "reviews_count": 267,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600",
    },
    {
        "category_slug": "iluminacion",
        "name": "Baliza LED Ámbar Rotativa",
        "code": "BAL-LED-AMB",
        "brand": "HELLA",
        "description": "Baliza LED ámbar rotativa 360°. Base magnética. Ideal para vehículos de carga. 12/24V.",
        "price": Decimal("18500.00"),
        "stock": 25,
        "rating": Decimal("4.6"),
        "reviews_count": 145,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
        "category_slug": "iluminacion",
        "name": "Ficha Eléctrica 7 Vías ISO",
        "code": "FIC-7V-ISO",
        "brand": "GENERIC",
        "description": "Ficha eléctrica 7 vías norma ISO 1185. Contactos de latón. Tapa protectora incluida.",
        "price": Decimal("4500.00"),
        "stock": 150,
        "rating": Decimal("4.3"),
        "reviews_count": 312,
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600",
    },
    {
        "category_slug": "iluminacion",
        "name": "Kit Cableado Completo Semirremolque",
        "code": "CAB-KIT-SR",
        "brand": "GENERIC",
        "description": "Kit de cableado completo para semirremolque. Incluye cables, fichas, terminales y espiral.",
        "price": Decimal("45000.00"),
        "stock": 12,
        "rating": Decimal("4.5"),
        "reviews_count": 78,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    
    # ===== ACCESORIOS =====
    {
        "category_slug": "accesorios",
        "name": "King Pin JOST 2\" x 3.5\"",
        "code": "KP-JOS-235",
        "brand": "JOST",
        "description": "King pin JOST original 2\" x 3.5\". Acero de alta resistencia. Certificado para cargas pesadas.",
        "price": Decimal("125000.00"),
        "original_price": Decimal("145000.00"),
        "stock": 6,
        "is_featured": True,
        "rating": Decimal("4.8"),
        "reviews_count": 89,
        "image_url": "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600",
    },
    {
        "category_slug": "accesorios",
        "name": "Pata de Apoyo SAF 28 Ton",
        "code": "PAT-SAF-28",
        "brand": "SAF",
        "description": "Pata de apoyo SAF capacidad 28 toneladas. Manivela reforzada. Base antideslizante.",
        "price": Decimal("195000.00"),
        "original_price": Decimal("220000.00"),
        "stock": 0,  # Sin stock para probar
        "rating": Decimal("4.6"),
        "reviews_count": 67,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
        "category_slug": "accesorios",
        "name": "Guardabarro Plástico 600mm",
        "code": "GUA-PLA-600",
        "brand": "GENERIC",
        "description": "Guardabarro plástico negro 600mm. Material resistente a impactos. Fácil instalación.",
        "price": Decimal("18500.00"),
        "stock": 45,
        "rating": Decimal("4.2"),
        "reviews_count": 156,
        "image_url": "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600",
    },
    {
        "category_slug": "accesorios",
        "name": "Gancho de Cadena Crosby 10mm",
        "code": "GAN-CRO-10",
        "brand": "CROSBY",
        "description": "Gancho de cadena Crosby grado 80, 10mm. Capacidad 3.15 toneladas. Certificado.",
        "price": Decimal("12500.00"),
        "stock": 80,
        "rating": Decimal("4.5"),
        "reviews_count": 98,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    
    # ===== LONAS =====
    {
        "category_slug": "lonas-carpas",
        "name": "Lona Sansuy 900gr Premium (m²)",
        "code": "LON-SAN-900",
        "brand": "SANSUY",
        "description": "Lona Sansuy 900gr/m² premium. Resistente a UV y agua. Color negro. Precio por metro cuadrado.",
        "price": Decimal("4500.00"),
        "stock": 500,
        "is_featured": True,
        "rating": Decimal("4.7"),
        "reviews_count": 234,
        "image_url": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600",
    },
    {
        "category_slug": "lonas-carpas",
        "name": "Tensor de Lona Acero Inox",
        "code": "TEN-INX-50",
        "brand": "GENERIC",
        "description": "Tensor de lona acero inoxidable 50mm. Gancho doble. Resistente a la corrosión.",
        "price": Decimal("3500.00"),
        "stock": 200,
        "rating": Decimal("4.4"),
        "reviews_count": 178,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
        "category_slug": "lonas-carpas",
        "name": "Kit Herrajes Lona Completo",
        "code": "KIT-HRJ-LON",
        "brand": "GENERIC",
        "description": "Kit completo de herrajes para lona. Incluye tensores, ganchos, argollas y ojales. 50 piezas.",
        "price": Decimal("35000.00"),
        "stock": 20,
        "is_new": True,
        "rating": Decimal("4.6"),
        "reviews_count": 45,
        "image_url": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600",
    },
]


async def clear_products():
    """Eliminar todos los productos y categorías"""
    async with AsyncSessionLocal() as db:
        await db.execute(delete(Product))
        await db.execute(delete(Category))
        await db.commit()
        print("[OK] Productos y categorias eliminados")


async def load_categories():
    """Cargar categorías"""
    async with AsyncSessionLocal() as db:
        categories = {}
        for cat_data in CATEGORIES:
            # Verificar si ya existe
            result = await db.execute(
                select(Category).where(Category.slug == cat_data["slug"])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                categories[cat_data["slug"]] = existing
                print(f"    -> Categoria '{cat_data['name']}' ya existe")
            else:
                category = Category(**cat_data)
                db.add(category)
                await db.flush()
                categories[cat_data["slug"]] = category
                print(f"    [+] Categoria '{cat_data['name']}' creada")
        
        await db.commit()
        return categories


async def load_products(categories: dict):
    """Cargar productos"""
    async with AsyncSessionLocal() as db:
        count_new = 0
        count_existing = 0
        
        for prod_data in PRODUCTS:
            cat_slug = prod_data.pop("category_slug")
            category = categories.get(cat_slug)
            
            if not category:
                print(f"    [X] Categoria '{cat_slug}' no encontrada para {prod_data['name']}")
                continue
            
            # Verificar si ya existe
            result = await db.execute(
                select(Product).where(Product.code == prod_data["code"])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                count_existing += 1
                # Restaurar category_slug para la próxima iteración
                prod_data["category_slug"] = cat_slug
            else:
                # Valores por defecto
                prod_data.setdefault("original_price", None)
                prod_data.setdefault("is_featured", False)
                prod_data.setdefault("is_new", False)
                prod_data.setdefault("rating", Decimal("4.0"))
                prod_data.setdefault("reviews_count", 0)
                
                product = Product(
                    category_id=category.id,
                    **prod_data
                )
                db.add(product)
                count_new += 1
                print(f"    [+] Producto '{prod_data['name']}' agregado")
                
                # Restaurar category_slug
                prod_data["category_slug"] = cat_slug
        
        await db.commit()
        return count_new, count_existing


async def main():
    """Función principal"""
    print("\n" + "="*60)
    print("   CARGA DE PRODUCTOS - MALDONADO REPUESTOS")
    print("="*60 + "\n")
    
    # Verificar si se pide limpiar
    if "--clear" in sys.argv:
        print("[*] Limpiando base de datos...")
        await clear_products()
        print()
    
    await create_tables()
    
    print("[+] Cargando categorias...")
    categories = await load_categories()
    print(f"    Total: {len(categories)} categorias\n")
    
    print("[+] Cargando productos...")
    new, existing = await load_products(categories)
    print(f"\n    Nuevos: {new} | Ya existentes: {existing}")
    
    print("\n" + "="*60)
    print("   CARGA COMPLETADA!")
    print("="*60)
    print("""
Proximos pasos:
   1. Frontend: http://localhost:3000
   2. API Docs: http://localhost:8000/docs
   3. Probar login: admin@maldonadorepuestos.com / admin123
""")


if __name__ == "__main__":
    asyncio.run(main())

