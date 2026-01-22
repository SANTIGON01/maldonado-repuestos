"""
Product Image Model - Para múltiples imágenes por producto
"""
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    
    # URL de la imagen
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)

    # ID público de Cloudinary (para poder eliminar la imagen)
    public_id: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Orden de visualización (0 = imagen principal)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Si es la imagen principal
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Alt text para accesibilidad
    alt_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    product: Mapped["Product"] = relationship("Product", back_populates="images")

    def __repr__(self) -> str:
        return f"<ProductImage {self.id}: {self.product_id}>"
