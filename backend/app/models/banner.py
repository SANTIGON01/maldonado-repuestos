"""
Banner/Promo Model - Para slides promocionales en el Hero
"""
from datetime import datetime
from sqlalchemy import String, Text, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Banner(Base):
    __tablename__ = "banners"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Contenido principal
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Imagen de fondo (URL o path)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Marca del producto (para mostrar logo)
    brand: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Botón CTA
    button_text: Mapped[str | None] = mapped_column(String(50), nullable=True)
    button_link: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Códigos de productos asociados (opcional)
    product_codes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Tipo: 'promo', 'news', 'product', 'general'
    banner_type: Mapped[str] = mapped_column(String(20), default='promo')
    
    # Estilo/Color del banner
    bg_color: Mapped[str | None] = mapped_column(String(50), nullable=True)  # ej: 'red', 'dark', 'gradient-red'
    
    # Control de orden y visibilidad
    order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Fechas de vigencia (opcional)
    start_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Banner {self.id}: {self.title}>"

