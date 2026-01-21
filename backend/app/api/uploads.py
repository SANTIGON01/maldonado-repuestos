"""
Endpoint para subir imágenes de productos
- En producción: usa Cloudinary (almacenamiento en la nube)
- En desarrollo: usa sistema de archivos local
"""
import os
import uuid
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from app.utils.dependencies import get_admin_user
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/uploads", tags=["Uploads"])

# Directorio local para desarrollo
UPLOAD_DIR = Path("uploads/products")

# Extensiones permitidas
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# Tamaño máximo: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024


def is_cloudinary_configured():
    """Verifica si Cloudinary está configurado"""
    return bool(
        settings.CLOUDINARY_CLOUD_NAME and 
        settings.CLOUDINARY_API_KEY and 
        settings.CLOUDINARY_API_SECRET
    )


def get_cloudinary():
    """Configura y retorna cloudinary"""
    import cloudinary
    import cloudinary.uploader
    
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    return cloudinary.uploader


def get_upload_dir():
    """Asegura que el directorio de uploads exista (solo para desarrollo local)"""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOAD_DIR


async def upload_to_cloudinary(file_contents: bytes, filename: str) -> str:
    """Sube una imagen a Cloudinary y retorna la URL"""
    import cloudinary.uploader
    
    # Configurar Cloudinary
    import cloudinary
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    
    # Generar un ID único para el archivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    public_id = f"maldonado/products/{timestamp}_{unique_id}"
    
    try:
        # Subir a Cloudinary
        result = cloudinary.uploader.upload(
            file_contents,
            public_id=public_id,
            folder="maldonado/products",
            resource_type="image",
            overwrite=True,
            transformation=[
                {"quality": "auto:good"},
                {"fetch_format": "auto"}
            ]
        )
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir imagen a Cloudinary: {str(e)}"
        )


async def upload_to_local(file_contents: bytes, file_ext: str) -> str:
    """Sube una imagen al sistema de archivos local"""
    # Generar nombre único para el archivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    safe_filename = f"{timestamp}_{unique_id}{file_ext}"
    
    # Guardar el archivo
    upload_dir = get_upload_dir()
    file_path = upload_dir / safe_filename
    
    try:
        with open(file_path, "wb") as f:
            f.write(file_contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar el archivo: {str(e)}"
        )
    
    # Devolver la URL relativa (se concatenará con el backend URL en el frontend)
    return f"/uploads/products/{safe_filename}"


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user)
):
    """
    Subir una imagen de producto.
    - En producción (Cloudinary configurado): sube a la nube
    - En desarrollo: guarda localmente
    
    Requiere autenticación de administrador.
    
    Returns:
        dict: URL de la imagen subida
    """
    # Validar que sea un archivo
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporciono ningun archivo"
        )
    
    # Validar extensión
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validar content type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen"
        )
    
    # Leer contenido y validar tamaño
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El archivo es demasiado grande. Maximo: {MAX_FILE_SIZE // (1024 * 1024)}MB"
        )
    
    # Subir según el entorno
    if is_cloudinary_configured():
        # Producción: usar Cloudinary
        image_url = await upload_to_cloudinary(contents, file.filename)
        storage_type = "cloudinary"
    else:
        # Desarrollo: usar sistema local
        image_url = await upload_to_local(contents, file_ext)
        storage_type = "local"
    
    return {
        "success": True,
        "image_url": image_url,
        "storage": storage_type
    }


@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    admin: User = Depends(get_admin_user)
):
    """
    Eliminar una imagen subida (solo funciona para archivos locales).
    Para Cloudinary, las imágenes se gestionan desde el dashboard.
    """
    # Prevenir path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre de archivo invalido"
        )
    
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo no encontrado"
        )
    
    try:
        file_path.unlink()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el archivo: {str(e)}"
        )
    
    return {"success": True, "message": "Imagen eliminada"}
