"""
Product Model
Optimizado con índices para consultas frecuentes
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Text, DateTime, ForeignKey, Numeric, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        # Índices compuestos para búsquedas frecuentes
        Index('ix_products_active_category', 'is_active', 'category_id'),
        Index('ix_products_active_featured', 'is_active', 'is_featured'),
        Index('ix_products_active_created', 'is_active', 'created_at'),
        Index('ix_products_active_price', 'is_active', 'price'),
        Index('ix_products_active_on_promotion', 'is_active', 'is_on_promotion'),
        {'sqlite_autoincrement': True},
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    
    # Basic info - índices para búsquedas
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Pricing
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    original_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    
    # Inventory
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Media
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Status flags
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(default=False, nullable=False)
    is_new: Mapped[bool] = mapped_column(default=False, nullable=False)
    is_on_promotion: Mapped[bool] = mapped_column(default=False, nullable=False)
    
    # Stats
    rating: Mapped[Decimal] = mapped_column(Numeric(2, 1), default=Decimal("0.0"), nullable=False)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.display_order"
    )
    cart_items: Mapped[list["CartItem"]] = relationship(
        "CartItem", 
        back_populates="product",
        cascade="all, delete-orphan"
    )
    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", 
        back_populates="product",
        passive_deletes=True
    )
    quote_items: Mapped[list["QuoteItem"]] = relationship(
        "QuoteItem",
        back_populates="product",
        passive_deletes=True
    )

    @property
    def in_stock(self) -> bool:
        return self.stock > 0

    @property
    def discount_percent(self) -> int | None:
        if self.original_price and self.original_price > self.price:
            return int((1 - self.price / self.original_price) * 100)
        return None

    def __repr__(self) -> str:
        return f"<Product {self.code}: {self.name}>"

