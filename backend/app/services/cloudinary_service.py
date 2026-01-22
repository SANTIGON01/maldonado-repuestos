"""
Cloudinary Image Upload Service
Maneja la subida, eliminación y gestión de imágenes en Cloudinary
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import UploadFile, HTTPException
from app.config import settings
from typing import Dict, Optional
import os


class CloudinaryService:
    """Servicio para gestionar imágenes en Cloudinary"""

    def __init__(self):
        """Inicializa la configuración de Cloudinary"""
        # Log para debug
        cloud_name = settings.CLOUDINARY_CLOUD_NAME
        api_key = settings.CLOUDINARY_API_KEY
        api_secret = settings.CLOUDINARY_API_SECRET

        is_configured = bool(cloud_name and api_key and api_secret)

        print(f"[Cloudinary] Configured: {is_configured}, Cloud: {cloud_name or 'N/A'}...")

        if not is_configured:
            print("[Cloudinary] WARNING: Credenciales no configuradas. Upload de imágenes no funcionará.")
            print(f"[Cloudinary] CLOUD_NAME presente: {bool(cloud_name)}")
            print(f"[Cloudinary] API_KEY presente: {bool(api_key)}")
            print(f"[Cloudinary] API_SECRET presente: {bool(api_secret)}")

        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret
        )

    async def upload_image(
        self,
        file: UploadFile,
        folder: str = "products"
    ) -> Dict[str, str]:
        """
        Sube una imagen a Cloudinary

        Args:
            file: Archivo de imagen a subir
            folder: Carpeta en Cloudinary donde guardar la imagen

        Returns:
            Dict con url y public_id de la imagen

        Raises:
            HTTPException: Si hay error en la subida o validación
        """
        # Validar tipo de archivo
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de archivo no permitido. Use: {', '.join(allowed_types)}"
            )

        # Validar tamaño (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB en bytes
        file_content = await file.read()
        file_size = len(file_content)

        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"Archivo muy grande. Tamaño máximo: 5MB (actual: {file_size / (1024 * 1024):.2f}MB)"
            )

        # Reset file pointer
        await file.seek(0)

        try:
            # Subir a Cloudinary
            result = cloudinary.uploader.upload(
                file.file,
                folder=folder,
                resource_type="image",
                # Optimizaciones automáticas
                quality="auto",
                fetch_format="auto",
                # Transformaciones
                transformation=[
                    {"width": 1200, "crop": "limit"},  # Max width 1200px
                    {"quality": "auto:good"}
                ]
            )

            return {
                "url": result["secure_url"],
                "public_id": result["public_id"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format")
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al subir imagen a Cloudinary: {str(e)}"
            )

    async def delete_image(self, public_id: str) -> bool:
        """
        Elimina una imagen de Cloudinary

        Args:
            public_id: ID público de la imagen en Cloudinary

        Returns:
            True si se eliminó correctamente, False en caso contrario
        """
        if not public_id:
            return False

        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            # Log error pero no fallar (la imagen puede no existir)
            print(f"Error al eliminar imagen de Cloudinary: {str(e)}")
            return False

    async def delete_images(self, public_ids: list[str]) -> Dict[str, int]:
        """
        Elimina múltiples imágenes de Cloudinary

        Args:
            public_ids: Lista de IDs públicos de las imágenes

        Returns:
            Dict con contadores de éxito y fallo
        """
        success = 0
        failed = 0

        for public_id in public_ids:
            if await self.delete_image(public_id):
                success += 1
            else:
                failed += 1

        return {
            "success": success,
            "failed": failed,
            "total": len(public_ids)
        }

    def get_optimized_url(
        self,
        public_id: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        crop: str = "limit"
    ) -> str:
        """
        Genera URL optimizada con transformaciones

        Args:
            public_id: ID público de la imagen
            width: Ancho deseado
            height: Alto deseado
            crop: Modo de recorte

        Returns:
            URL optimizada de la imagen
        """
        transformations = []

        if width or height:
            trans = {"crop": crop}
            if width:
                trans["width"] = width
            if height:
                trans["height"] = height
            transformations.append(trans)

        transformations.append({"quality": "auto", "fetch_format": "auto"})

        return cloudinary.CloudinaryImage(public_id).build_url(
            transformation=transformations,
            secure=True
        )


# Instancia singleton del servicio
cloudinary_service = CloudinaryService()
