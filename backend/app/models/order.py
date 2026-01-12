"""
Order Models
"""
from datetime import datetime
from decimal import Decimal
from enum import Enum
from sqlalchemy import String, Text, DateTime, ForeignKey, Numeric, Integer, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class OrderStatus(str, Enum):
    PENDING = "pending"
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # Order info
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        SQLEnum(OrderStatus), 
        default=OrderStatus.PENDING, 
        nullable=False
    )
    
    # Pricing
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    shipping_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    
    # Payment
    payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    payment_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Shipping address
    shipping_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    shipping_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    shipping_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    shipping_state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    shipping_zip: Mapped[str | None] = mapped_column(String(20), nullable=True)
    shipping_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Notes
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
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
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", 
        back_populates="order",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Order {self.order_number}>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    
    # Snapshot of product at time of order
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    product_code: Mapped[str] = mapped_column(String(50), nullable=False)
    product_brand: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Pricing & quantity
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")

    def __repr__(self) -> str:
        return f"<OrderItem {self.product_code} x{self.quantity}>"

