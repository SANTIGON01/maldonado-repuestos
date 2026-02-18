"""
Backup de la DB de Railway a PostgreSQL local o archivos JSON.
SOLO LECTURA sobre Railway — nunca modifica datos en producción.

Uso:
    # Backup a DB local (copia todas las tablas)
    python backup_db.py

    # Backup a archivos JSON
    python backup_db.py --format json --output ./backups/

    # Especificar URL de origen manualmente
    RAILWAY_DATABASE_URL="postgresql://..." python backup_db.py
"""
import argparse
import json
import os
import sys
from datetime import datetime, date
from decimal import Decimal
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text, inspect, MetaData

# Orden de tablas respetando foreign keys (padres primero)
TABLES_ORDER = [
    "users",
    "categories",
    "products",
    "product_images",
    "cart_items",
    "orders",
    "order_items",
    "quotes",
    "quote_items",
    "banners",
]


def get_source_url() -> str:
    """Obtiene la URL de Railway desde variable de entorno."""
    url = os.getenv("RAILWAY_DATABASE_URL", "")
    if not url:
        print("ERROR: Variable RAILWAY_DATABASE_URL no definida.")
        print("Uso: RAILWAY_DATABASE_URL=\"postgresql://user:pass@host:port/db\" python backup_db.py")
        sys.exit(1)
    # Normalizar a formato psycopg2 (sync)
    url = url.strip()
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "", 1)
    return url


def get_local_url() -> str:
    """URL de la DB local para restaurar."""
    url = os.getenv("LOCAL_DATABASE_URL", "postgresql://postgres:Santi2012@localhost:5432/maldonado")
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "", 1)
    return url


class JSONEncoder(json.JSONEncoder):
    """Encoder que maneja tipos de SQLAlchemy/Python."""
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, bytes):
            return obj.decode("utf-8", errors="replace")
        return super().default(obj)


def backup_to_json(output_dir: str) -> None:
    """Exporta todas las tablas de Railway a archivos JSON."""
    source_url = get_source_url()
    source_engine = create_engine(source_url, echo=False)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = output_path / f"backup_{timestamp}"
    backup_dir.mkdir(exist_ok=True)

    print(f"Exportando Railway DB a JSON en {backup_dir}/")

    with source_engine.connect() as conn:
        inspector = inspect(source_engine)
        existing_tables = inspector.get_table_names()

        total_rows = 0
        for table_name in TABLES_ORDER:
            if table_name not in existing_tables:
                print(f"  SKIP {table_name} (no existe en origen)")
                continue

            rows = conn.execute(text(f'SELECT * FROM "{table_name}"')).mappings().all()
            rows_list = [dict(r) for r in rows]

            file_path = backup_dir / f"{table_name}.json"
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(rows_list, f, cls=JSONEncoder, ensure_ascii=False, indent=2)

            total_rows += len(rows_list)
            print(f"  {table_name}: {len(rows_list)} registros")

    source_engine.dispose()

    # Metadata del backup
    meta = {
        "timestamp": timestamp,
        "tables": TABLES_ORDER,
        "total_rows": total_rows,
    }
    with open(backup_dir / "_metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\nBackup completado: {total_rows} registros en {backup_dir}/")


def backup_to_local_db() -> None:
    """Copia todas las tablas de Railway a la DB local PostgreSQL."""
    source_url = get_source_url()
    local_url = get_local_url()

    source_engine = create_engine(source_url, echo=False)
    local_engine = create_engine(local_url, echo=False)

    print(f"Copiando Railway DB a DB local...")

    with source_engine.connect() as source_conn:
        inspector = inspect(source_engine)
        existing_tables = inspector.get_table_names()

        # Reflejar metadata de las tablas origen
        metadata = MetaData()
        metadata.reflect(bind=source_engine)

        with local_engine.begin() as local_conn:
            # Desactivar FK checks temporalmente para poder truncar
            local_conn.execute(text("SET session_replication_role = 'replica'"))

            total_rows = 0
            for table_name in TABLES_ORDER:
                if table_name not in existing_tables:
                    print(f"  SKIP {table_name} (no existe en origen)")
                    continue

                table = metadata.tables.get(table_name)
                if table is None:
                    print(f"  SKIP {table_name} (no reflejada)")
                    continue

                # Leer datos del origen
                rows = source_conn.execute(text(f'SELECT * FROM "{table_name}"')).mappings().all()
                rows_list = [dict(r) for r in rows]

                # Limpiar tabla local y re-insertar
                local_conn.execute(text(f'DELETE FROM "{table_name}"'))

                if rows_list:
                    local_conn.execute(table.insert(), rows_list)

                total_rows += len(rows_list)
                print(f"  {table_name}: {len(rows_list)} registros copiados")

            # Restaurar FK checks
            local_conn.execute(text("SET session_replication_role = 'origin'"))

            # Resetear secuencias para que los IDs no colisionen
            for table_name in TABLES_ORDER:
                if table_name not in existing_tables:
                    continue
                try:
                    local_conn.execute(text(
                        f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), "
                        f"COALESCE((SELECT MAX(id) FROM \"{table_name}\"), 0) + 1, false)"
                    ))
                except Exception:
                    pass  # Tabla sin columna id serial

    source_engine.dispose()
    local_engine.dispose()
    print(f"\nBackup completado: {total_rows} registros copiados a DB local")


def main():
    parser = argparse.ArgumentParser(description="Backup de Railway DB")
    parser.add_argument(
        "--format", choices=["db", "json"], default="db",
        help="Formato de backup: 'db' copia a PostgreSQL local, 'json' exporta archivos (default: db)"
    )
    parser.add_argument(
        "--output", default="./backups",
        help="Directorio de salida para backups JSON (default: ./backups/)"
    )
    args = parser.parse_args()

    if args.format == "json":
        backup_to_json(args.output)
    else:
        backup_to_local_db()


if __name__ == "__main__":
    main()
