"""
Script de migración: SQLite -> PostgreSQL
Migra todos los datos de maldonado.db a la base de datos PostgreSQL

Uso: python migrate_to_postgres.py
"""

import sqlite3
import psycopg2
from datetime import datetime

# Configuración
SQLITE_DB = "maldonado.db"
POSTGRES_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "maldonado",
    "user": "postgres",
    "password": "Santi2012"
}


def get_sqlite_connection():
    """Conectar a SQLite"""
    return sqlite3.connect(SQLITE_DB)


def get_postgres_connection():
    """Conectar a PostgreSQL"""
    return psycopg2.connect(**POSTGRES_CONFIG)


def get_table_names(sqlite_conn):
    """Obtener nombres de tablas de SQLite"""
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    return [row[0] for row in cursor.fetchall()]


def get_table_schema(sqlite_conn, table_name):
    """Obtener columnas de una tabla"""
    cursor = sqlite_conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name});")
    return cursor.fetchall()


def get_table_data(sqlite_conn, table_name):
    """Obtener todos los datos de una tabla"""
    cursor = sqlite_conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name};")
    return cursor.fetchall()


def sqlite_to_postgres_type(sqlite_type):
    """Convertir tipos de SQLite a PostgreSQL"""
    sqlite_type = sqlite_type.upper()
    type_mapping = {
        "INTEGER": "INTEGER",
        "REAL": "DOUBLE PRECISION",
        "TEXT": "TEXT",
        "BLOB": "BYTEA",
        "VARCHAR": "VARCHAR",
        "BOOLEAN": "BOOLEAN",
        "DATETIME": "TIMESTAMP",
        "DATE": "DATE",
        "FLOAT": "DOUBLE PRECISION",
    }
    
    for sqlite_t, postgres_t in type_mapping.items():
        if sqlite_t in sqlite_type:
            # Mantener longitud si existe (ej: VARCHAR(255))
            if "(" in sqlite_type:
                return sqlite_type.replace(sqlite_t, postgres_t)
            return postgres_t
    
    return "TEXT"  # Default


def create_postgres_table(pg_conn, table_name, schema):
    """Crear tabla en PostgreSQL basada en el esquema de SQLite"""
    columns = []
    
    for col in schema:
        col_id, col_name, col_type, not_null, default_val, is_pk = col
        
        pg_type = sqlite_to_postgres_type(col_type)
        
        col_def = f'"{col_name}" {pg_type}'
        
        if is_pk:
            if pg_type == "INTEGER":
                col_def = f'"{col_name}" SERIAL'
            col_def += " PRIMARY KEY"
        
        if not_null and not is_pk:
            col_def += " NOT NULL"
            
        if default_val is not None and not is_pk:
            # Manejar defaults especiales
            default_lower = str(default_val).lower().strip()
            
            if default_lower in ("current_timestamp", "datetime('now')", "(datetime('now'))"):
                col_def += " DEFAULT CURRENT_TIMESTAMP"
            elif "BOOLEAN" in pg_type.upper():
                # Solo aplicar booleanos si el tipo es boolean
                bool_val = "TRUE" if default_lower in ("true", "1") else "FALSE"
                col_def += f" DEFAULT {bool_val}"
            elif pg_type.upper() == "INTEGER" and default_lower in ("0", "1"):
                # Para INTEGER, mantener el numero
                col_def += f" DEFAULT {default_val}"
            elif default_lower not in ("true", "false"):
                # Otros defaults, pero evitar true/false en columnas no boolean
                col_def += f" DEFAULT {default_val}"
        
        columns.append(col_def)
    
    create_sql = f'CREATE TABLE IF NOT EXISTS "{table_name}" (\n  {",".join(columns)}\n);'
    
    cursor = pg_conn.cursor()
    try:
        cursor.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE;')
        cursor.execute(create_sql)
        pg_conn.commit()
        print(f"  [OK] Tabla '{table_name}' creada")
    except Exception as e:
        pg_conn.rollback()
        print(f"  [ERROR] Error creando tabla '{table_name}': {e}")
        raise


def migrate_table_data(sqlite_conn, pg_conn, table_name, schema):
    """Migrar datos de una tabla"""
    data = get_table_data(sqlite_conn, table_name)
    
    if not data:
        print(f"  [-] Tabla '{table_name}' vacia, saltando...")
        return 0
    
    col_names = [f'"{col[1]}"' for col in schema]
    placeholders = ", ".join(["%s"] * len(col_names))
    
    insert_sql = f'INSERT INTO "{table_name}" ({", ".join(col_names)}) VALUES ({placeholders})'
    
    cursor = pg_conn.cursor()
    migrated = 0
    
    for row in data:
        # Convertir valores None y booleanos
        converted_row = []
        for i, val in enumerate(row):
            col_type = schema[i][2].upper()
            
            if val is None:
                converted_row.append(None)
            elif "BOOLEAN" in col_type or col_type == "INTEGER" and val in (0, 1) and schema[i][1].startswith("is_"):
                converted_row.append(bool(val) if val is not None else None)
            else:
                converted_row.append(val)
        
        try:
            cursor.execute(insert_sql, tuple(converted_row))
            migrated += 1
        except Exception as e:
            print(f"    [WARN] Error insertando fila en '{table_name}': {e}")
            print(f"      Datos: {converted_row}")
    
    pg_conn.commit()
    return migrated


def reset_sequences(pg_conn, table_name, schema):
    """Resetear secuencias de autoincremento en PostgreSQL"""
    cursor = pg_conn.cursor()
    
    for col in schema:
        col_name = col[1]
        is_pk = col[5]
        
        if is_pk:
            seq_name = f"{table_name}_{col_name}_seq"
            try:
                cursor.execute(f"""
                    SELECT setval(pg_get_serial_sequence('"{table_name}"', '{col_name}'), 
                           COALESCE((SELECT MAX("{col_name}") FROM "{table_name}"), 1));
                """)
                pg_conn.commit()
            except Exception:
                pass  # La secuencia puede no existir


def main():
    """Funcion principal de migracion"""
    print("=" * 60)
    print("MIGRACION SQLite -> PostgreSQL")
    print("=" * 60)
    print(f"\nOrigen: {SQLITE_DB}")
    print(f"Destino: PostgreSQL @ {POSTGRES_CONFIG['host']}:{POSTGRES_CONFIG['port']}/{POSTGRES_CONFIG['database']}")
    print("-" * 60)
    
    # Conectar a ambas bases de datos
    print("\n[1/4] Conectando a las bases de datos...")
    
    try:
        sqlite_conn = get_sqlite_connection()
        print("  [OK] SQLite conectado")
    except Exception as e:
        print(f"  [ERROR] Error conectando a SQLite: {e}")
        return
    
    try:
        pg_conn = get_postgres_connection()
        print("  [OK] PostgreSQL conectado")
    except Exception as e:
        print(f"  [ERROR] Error conectando a PostgreSQL: {e}")
        return
    
    # Obtener tablas
    print("\n[2/4] Obteniendo tablas de SQLite...")
    tables = get_table_names(sqlite_conn)
    print(f"  [INFO] Encontradas {len(tables)} tablas: {', '.join(tables)}")
    
    # Orden de migración (respetando foreign keys)
    table_order = [
        "users",
        "categories", 
        "products",
        "product_images",
        "cart_items",
        "orders",
        "order_items",
        "quotes",
        "banners"
    ]
    
    # Filtrar solo tablas que existen
    tables_to_migrate = [t for t in table_order if t in tables]
    # Agregar cualquier tabla que no esté en el orden
    for t in tables:
        if t not in tables_to_migrate:
            tables_to_migrate.append(t)
    
    # Crear tablas
    print("\n[3/4] Creando tablas en PostgreSQL...")
    for table in tables_to_migrate:
        schema = get_table_schema(sqlite_conn, table)
        create_postgres_table(pg_conn, table, schema)
    
    # Migrar datos
    print("\n[4/4] Migrando datos...")
    total_records = 0
    
    for table in tables_to_migrate:
        schema = get_table_schema(sqlite_conn, table)
        count = migrate_table_data(sqlite_conn, pg_conn, table, schema)
        reset_sequences(pg_conn, table, schema)
        
        if count > 0:
            print(f"  [OK] '{table}': {count} registros migrados")
            total_records += count
    
    # Cerrar conexiones
    sqlite_conn.close()
    pg_conn.close()
    
    print("\n" + "=" * 60)
    print(f"MIGRACION COMPLETADA!")
    print(f"   Total de registros migrados: {total_records}")
    print("=" * 60)


if __name__ == "__main__":
    main()
