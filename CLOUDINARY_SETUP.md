# Configuración de Cloudinary para Almacenamiento de Imágenes

## Problema Resuelto

El sistema de imágenes ahora utiliza **Cloudinary** para almacenamiento persistente en la nube, resolviendo el problema de pérdida de imágenes al reiniciar el contenedor de Railway.

## Características

- ✅ Almacenamiento persistente en la nube
- ✅ CDN global incluido (carga rápida desde cualquier ubicación)
- ✅ Optimización automática de imágenes (WebP, compresión)
- ✅ Transformaciones on-the-fly (resize, crop)
- ✅ Upload directo desde el panel de administración
- ✅ Eliminación automática al borrar productos
- ✅ Validación de tamaño (max 5MB) y tipo (JPG, PNG, WebP)
- ✅ Compatible con URLs externas (modo legacy)

---

## 1. Crear Cuenta en Cloudinary

1. Ir a [https://cloudinary.com](https://cloudinary.com)
2. Registrarse gratis (no requiere tarjeta de crédito)
3. Confirmar email

**Plan Gratuito incluye:**
- 25 GB de almacenamiento
- 25 GB de bandwidth mensual
- Transformaciones ilimitadas
- Suficiente para proyectos pequeños/medianos

---

## 2. Obtener Credenciales

Desde el Dashboard de Cloudinary:

1. **Cloud Name**: `demo` (ejemplo)
2. **API Key**: `123456789012345` (ejemplo)
3. **API Secret**: `abc123def456ghi789jkl012` (ejemplo)

Ubicación: Panel de inicio > "Account Details" > "API Keys"

---

## 3. Configurar Variables de Entorno

### Para Desarrollo Local

Crear/editar el archivo `backend/.env`:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### Para Railway (Producción)

1. Ir al proyecto en Railway
2. Seleccionar el servicio backend
3. Ir a pestaña "Variables"
4. Agregar las siguientes variables:

```
CLOUDINARY_CLOUD_NAME = tu-cloud-name
CLOUDINARY_API_KEY = tu-api-key
CLOUDINARY_API_SECRET = tu-api-secret
```

5. Guardar (se reiniciará automáticamente)

---

## 4. Instalar Dependencias

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Esto instalará `cloudinary==1.41.0` automáticamente.

---

## 5. Actualizar Base de Datos (Opcional)

El campo `public_id` fue agregado al modelo `ProductImage`. Si usás Alembic para migraciones:

```bash
cd backend
alembic revision --autogenerate -m "Add public_id to product_images"
alembic upgrade head
```

Si no usás Alembic, el campo es **nullable** (opcional), por lo que la aplicación seguirá funcionando. Solo necesitás ejecutar el SQL manualmente si querés:

```sql
ALTER TABLE product_images ADD COLUMN public_id VARCHAR(200);
```

---

## 6. Probar en Local

### Iniciar Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### Iniciar Frontend

```bash
cd frontend
npm run dev
```

### Probar Upload

1. Ir a `http://localhost:3000/admin`
2. Login como admin
3. Crear/editar producto
4. En sección "IMÁGENES DEL PRODUCTO":
   - Click en botón "SUBIR ARCHIVO"
   - Seleccionar imagen (max 5MB)
   - Click "SUBIR"
5. Verificar que aparece en el producto
6. Ir al Dashboard de Cloudinary
7. Verificar que la imagen está en carpeta `products/`

---

## 7. Deploy a Producción

### Método 1: Git Push (Recomendado)

Si Railway está configurado para deploy automático:

```bash
git add .
git commit -m "feat: Integración Cloudinary para almacenamiento persistente de imágenes"
git push origin main
```

Railway detectará los cambios y desplegará automáticamente.

### Método 2: Railway CLI

```bash
railway up
```

### Verificar Deploy

1. Esperar que el deploy termine (ver logs en Railway)
2. Verificar que las variables de entorno están configuradas
3. Probar upload desde el panel admin en producción

---

## 8. Uso desde el Panel Admin

### Subir Imagen Local

1. Ir a panel admin > Productos
2. Crear/editar producto
3. Scroll a "IMÁGENES DEL PRODUCTO"
4. Click en "SUBIR ARCHIVO"
5. Seleccionar archivo (JPG, PNG, WebP - max 5MB)
6. Click "SUBIR" (se mostrará spinner mientras sube)
7. La imagen aparecerá en la galería

### Pegar URL Externa (Modo Legacy)

1. Click en "PEGAR URL"
2. Pegar URL de imagen externa
3. Click "+ AGREGAR"

**Nota**: Las URLs externas seguirán funcionando pero NO se almacenan en Cloudinary.

### Gestión de Imágenes

- **Marcar como principal**: Click en ★
- **Reordenar**: Click en ↑ o ↓
- **Eliminar**: Click en ✕
- Primera imagen = imagen principal automáticamente

---

## 9. Estructura de Archivos Modificados

### Backend (7 archivos)

```
backend/
├── requirements.txt                        # + cloudinary==1.41.0
├── app/
│   ├── config.py                          # + Variables Cloudinary
│   ├── models/product_image.py            # + Campo public_id
│   ├── schemas/product.py                 # + Campo public_id
│   ├── api/admin.py                       # + Endpoint upload, modificado delete
│   └── services/
│       └── cloudinary_service.py          # NUEVO servicio
```

### Frontend (2 archivos)

```
frontend/
└── src/
    ├── lib/api.js                          # + uploadProductImage()
    └── pages/AdminPage.jsx                 # + UI upload file
```

---

## 10. Endpoints API

### POST /api/admin/upload-image

Sube una imagen a Cloudinary.

**Autenticación**: Bearer Token (Admin)

**Request**:
```http
POST /api/admin/upload-image
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [archivo de imagen]
```

**Response**:
```json
{
  "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/products/abc123.jpg",
  "public_id": "products/abc123",
  "width": 800,
  "height": 600,
  "format": "jpg"
}
```

**Errores**:
- `400`: Archivo muy grande o tipo no permitido
- `401`: No autenticado
- `500`: Error al subir a Cloudinary

---

## 11. Límites del Plan Gratuito

**Cloudinary Free Tier:**
- 25 GB almacenamiento
- 25 GB bandwidth/mes
- Transformaciones ilimitadas
- Sin límite de tiempo

**Estimación:**
- Imagen promedio: 500 KB
- Capacidad: ~50,000 imágenes
- Si se excede: cuenta requiere upgrade

**Monitorear uso:**
Dashboard Cloudinary > "Usage" > Ver gráficos de storage y bandwidth

---

## 12. Optimizaciones Aplicadas

El servicio de Cloudinary aplica automáticamente:

1. **Calidad automática**: `quality: "auto"`
2. **Formato automático**: `fetch_format: "auto"` (WebP para navegadores compatibles)
3. **Límite de ancho**: `width: 1200, crop: "limit"` (reduce imágenes muy grandes)
4. **CDN global**: Todas las URLs usan CDN de Cloudinary

---

## 13. Limpieza de Imágenes

### Automática

Cuando se elimina un producto, sus imágenes se borran automáticamente de Cloudinary:

```python
# En admin.py, endpoint DELETE /products/{id}
if product.images:
    public_ids = [img.public_id for img in product.images if img.public_id]
    if public_ids:
        await cloudinary_service.delete_images(public_ids)
```

### Manual (Opcional)

Si necesitás limpiar imágenes huérfanas:

1. Ir a Cloudinary Dashboard
2. Media Library > Carpeta "products"
3. Seleccionar imágenes no usadas
4. Delete

---

## 14. Troubleshooting

### Error: "Cloudinary credentials not configured"

**Solución**: Verificar que las 3 variables de entorno estén configuradas correctamente en Railway.

### Error: "Archivo muy grande"

**Solución**: Reducir tamaño de imagen a menos de 5MB antes de subir.

### Imágenes no se cargan en producción

**Solución**:
1. Verificar que las variables estén en Railway
2. Ver logs del backend: `railway logs`
3. Verificar que la imagen esté en Cloudinary Dashboard

### URLs de Cloudinary no funcionan

**Solución**:
1. Verificar que el `cloud_name` sea correcto
2. Verificar que la imagen no fue eliminada de Cloudinary
3. Revisar logs del navegador (F12 > Console)

---

## 15. Seguridad

### Variables de Entorno

- **NUNCA** commitear el archivo `.env` a Git
- `.env` está en `.gitignore` automáticamente
- Usar Railway/Vercel variables para producción

### API Secret

- `CLOUDINARY_API_SECRET` es sensible
- Solo el backend debe tenerlo
- Frontend nunca debe conocer el secret

### Upload Endpoint

- Requiere autenticación admin
- Valida tamaño y tipo de archivo
- No permite scripts o archivos ejecutables

---

## 16. Migración de Imágenes Antiguas (Opcional)

Si tenés productos con URLs externas y querés migrarlas a Cloudinary:

### Script Python (ejemplo)

```python
# backend/scripts/migrate_images_to_cloudinary.py
import asyncio
from app.database import get_db
from app.models.product import Product
from app.services.cloudinary_service import cloudinary_service
import httpx

async def migrate_images():
    async for db in get_db():
        products = await db.execute(select(Product).options(selectinload(Product.images)))
        products = products.scalars().all()

        for product in products:
            for img in product.images:
                if img.public_id is None and img.image_url.startswith('http'):
                    # Descargar imagen
                    async with httpx.AsyncClient() as client:
                        response = await client.get(img.image_url)
                        if response.status_code == 200:
                            # Subir a Cloudinary
                            result = cloudinary.uploader.upload(
                                response.content,
                                folder="products",
                                resource_type="image"
                            )
                            # Actualizar BD
                            img.image_url = result["secure_url"]
                            img.public_id = result["public_id"]
                            await db.commit()
                            print(f"Migrada imagen de producto {product.id}")

asyncio.run(migrate_images())
```

**Ejecutar**:
```bash
cd backend
python scripts/migrate_images_to_cloudinary.py
```

---

## 17. Backup

Las imágenes en Cloudinary tienen backup automático incluido. No necesitás configurar nada adicional.

**Para exportar todas las imágenes**:
1. Ir a Cloudinary Dashboard
2. Media Library
3. Seleccionar carpeta "products"
4. Download selected

---

## 18. Próximos Pasos (Opcional)

### Mejoras Futuras

1. **Drag & Drop**: Implementar drag & drop para subir imágenes
2. **Cropper**: Agregar herramienta de recorte antes de subir
3. **Lazy loading**: Implementar lazy loading en galería de productos
4. **Image variants**: Crear thumbnails automáticos
5. **Watermark**: Agregar marca de agua a las imágenes

### URLs Optimizadas

Ya se incluye el método `get_optimized_url()` en el servicio para generar URLs con transformaciones:

```python
# Generar thumbnail de 300x300
thumbnail_url = cloudinary_service.get_optimized_url(
    public_id="products/abc123",
    width=300,
    height=300,
    crop="fill"
)
```

---

## Contacto y Soporte

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Cloudinary Support**: https://support.cloudinary.com
- **Plan Upgrade**: Si necesitás más storage/bandwidth

---

**Implementado por**: Claude Code
**Fecha**: 2026-01-21
**Versión**: 1.0
