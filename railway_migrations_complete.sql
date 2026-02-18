-- =====================================================
-- MIGRACIONES COMPLETAS PARA RAILWAY
-- Fecha: 2026-02-10
-- Descripción: Agrega todas las columnas faltantes en producción
-- =====================================================

-- =====================================================
-- PASO 1: VERIFICAR ESTADO ACTUAL (Ejecutar primero)
-- =====================================================

-- Verificar columnas en products
SELECT 'VERIFICACIÓN products.is_on_promotion' AS check_name,
       column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name = 'is_on_promotion';

-- Verificar columnas en banners
SELECT 'VERIFICACIÓN banners.product_codes' AS check_name,
       column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'banners'
  AND column_name = 'product_codes';

-- Verificar columnas en product_images
SELECT 'VERIFICACIÓN product_images.public_id' AS check_name,
       column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product_images'
  AND column_name = 'public_id';

-- =====================================================
-- PASO 2: EJECUTAR MIGRACIONES (Si las verificaciones muestran 0 filas)
-- =====================================================

-- MIGRACIÓN 1: Sistema de Promociones - Campo is_on_promotion
-- Relacionado con: PR #13, commit 7d14b1d
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_on_promotion BOOLEAN DEFAULT FALSE NOT NULL;

-- MIGRACIÓN 2: Índice compuesto para optimizar queries de promociones
CREATE INDEX IF NOT EXISTS ix_products_active_on_promotion
ON products(is_active, is_on_promotion);

-- MIGRACIÓN 3: Sistema de Banners - Campo product_codes
-- Permite asociar banners con códigos de productos específicos
ALTER TABLE banners
ADD COLUMN IF NOT EXISTS product_codes TEXT;

-- MIGRACIÓN 4: ProductImages - Campo public_id para Cloudinary
-- Permite eliminar imágenes de Cloudinary al borrarlas
ALTER TABLE product_images
ADD COLUMN IF NOT EXISTS public_id VARCHAR(200);

-- =====================================================
-- PASO 3: VERIFICAR QUE LAS MIGRACIONES SE EJECUTARON
-- =====================================================

SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'products' AND column_name = 'is_on_promotion'
        ) THEN '✓ Existe'
        ELSE '✗ NO EXISTE - EJECUTAR MIGRACIÓN 1'
    END AS "products.is_on_promotion",

    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'banners' AND column_name = 'product_codes'
        ) THEN '✓ Existe'
        ELSE '✗ NO EXISTE - EJECUTAR MIGRACIÓN 3'
    END AS "banners.product_codes",

    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'product_images' AND column_name = 'public_id'
        ) THEN '✓ Existe'
        ELSE '✗ NO EXISTE - EJECUTAR MIGRACIÓN 4'
    END AS "product_images.public_id",

    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE indexname = 'ix_products_active_on_promotion'
        ) THEN '✓ Existe'
        ELSE '✗ NO EXISTE - EJECUTAR MIGRACIÓN 2'
    END AS "Índice ix_products_active_on_promotion";

-- =====================================================
-- PASO 4: (OPCIONAL) Ver estructura completa de las tablas
-- =====================================================

-- Ver todas las columnas de products
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'products'
-- ORDER BY ordinal_position;

-- Ver todas las columnas de banners
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'banners'
-- ORDER BY ordinal_position;

-- Ver todas las columnas de product_images
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'product_images'
-- ORDER BY ordinal_position;

-- =====================================================
-- RESUMEN DE CAMBIOS
-- =====================================================

-- Tabla: products
--   - is_on_promotion (BOOLEAN, NOT NULL, DEFAULT FALSE)
--   - Índice: ix_products_active_on_promotion (is_active, is_on_promotion)

-- Tabla: banners
--   - product_codes (TEXT, NULLABLE)

-- Tabla: product_images
--   - public_id (VARCHAR(200), NULLABLE)

-- =====================================================
-- INSTRUCCIONES DE USO EN RAILWAY
-- =====================================================

-- 1. Railway Dashboard → PostgreSQL service → Data tab
-- 2. Copiar y pegar SOLO el contenido del PASO 2 (las migraciones)
-- 3. Click en "Run Query"
-- 4. Verificar que aparece "ALTER TABLE" o "CREATE INDEX" sin errores
-- 5. Copiar y pegar el PASO 3 (verificación)
-- 6. Confirmar que todo dice "✓ Existe"
-- 7. Railway → Backend service → Settings → Restart
-- 8. Esperar 30 segundos
-- 9. Verificar logs del backend (sin errores de columnas)
-- 10. Probar: https://maldonado-repuestos-production.up.railway.app/api/products

-- =====================================================
-- FIN DE MIGRACIONES
-- =====================================================
