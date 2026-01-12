"""
Migration script para crear tabla de banners y agregar datos de ejemplo
"""
import asyncio
import sqlite3
from datetime import datetime

# Conexión directa a SQLite
DB_PATH = "maldonado.db"


def run_migration():
    print("[*] Iniciando migracion de banners...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Crear tabla banners
    print("[+] Creando tabla 'banners'...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS banners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(100) NOT NULL,
            subtitle VARCHAR(200),
            description TEXT,
            image_url VARCHAR(500),
            button_text VARCHAR(50),
            button_link VARCHAR(200),
            banner_type VARCHAR(20) DEFAULT 'promo',
            bg_color VARCHAR(50),
            "order" INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            start_date DATETIME,
            end_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Verificar si ya hay datos
    cursor.execute("SELECT COUNT(*) FROM banners")
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("[+] Insertando banners de ejemplo...")
        now = datetime.utcnow().isoformat()
        
        banners = [
            (
                "OFERTAS DE TEMPORADA",
                "Hasta 30% OFF en frenos",
                "Aprovecha los mejores precios en sistemas de frenos para semirremolques. Stock limitado.",
                "/images/banners/promo-frenos.jpg",
                "VER OFERTAS",
                "/catalogo/sistema-de-frenos",
                "promo",
                "gradient-red",
                1,
                1,
                now,
                now
            ),
            (
                "NUEVOS PRODUCTOS",
                "Iluminacion LED de ultima generacion",
                "Llegaron los nuevos faros LED con mayor potencia y durabilidad. Consulta disponibilidad.",
                "/images/banners/led-nuevo.jpg",
                "CONOCER MAS",
                "/catalogo/iluminacion",
                "news",
                "dark",
                2,
                1,
                now,
                now
            ),
            (
                "ENVIO GRATIS",
                "En compras mayores a $50.000",
                "Realizamos envios a todo el pais. Consulta condiciones.",
                "/images/banners/envio.jpg",
                "COMPRAR AHORA",
                "/catalogo",
                "promo",
                "gradient-dark",
                3,
                1,
                now,
                now
            ),
        ]
        
        cursor.executemany("""
            INSERT INTO banners (
                title, subtitle, description, image_url, button_text, button_link,
                banner_type, bg_color, "order", is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, banners)
        
        print(f"[OK] {len(banners)} banners creados")
    else:
        print(f"[!] Ya existen {count} banners, saltando insercion")
    
    conn.commit()
    conn.close()
    
    print("[OK] Migracion completada!")


if __name__ == "__main__":
    run_migration()

