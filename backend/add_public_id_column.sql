-- Migración: Agregar columna public_id a product_images
-- Esta columna almacena el public_id de Cloudinary para poder eliminar imágenes

ALTER TABLE product_images
ADD COLUMN IF NOT EXISTS public_id VARCHAR(200) NULL;

-- Verificar que se creó
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product_images' AND column_name = 'public_id';
