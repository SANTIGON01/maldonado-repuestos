"""
Quote Model (Cotizaciones)
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import String, Text, DateTime, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class QuoteStatus(str, Enum):
    PENDING = "pending"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    CLOSED = "closed"


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    
    # Contact info (can be filled without account)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Vehicle/Equipment info
    vehicle_info: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    # Request details
    message: Mapped[str] = mapped_column(Text, nullable=True)
    
    # WhatsApp tracking
    sent_via_whatsapp: Mapped[bool] = mapped_column(default=False, nullable=False)
    
    # Status
    status: Mapped[QuoteStatus] = mapped_column(
        SQLEnum(QuoteStatus), 
        default=QuoteStatus.PENDING, 
        nullable=False
    )
    
    # Admin notes
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
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
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User | None"] = relationship("User", back_populates="quotes")
    items: Mapped[list["QuoteItem"]] = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Quote {self.id} from {self.email}>"


class QuoteItem(Base):
    """Items de una cotización (productos solicitados)"""
    __tablename__ = "quote_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    quote_id: Mapped[int] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    
    # Guardamos código y nombre por si el producto cambia
    product_code: Mapped[str] = mapped_column(String(50), nullable=False)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # Relationships
    quote: Mapped["Quote"] = relationship("Quote", back_populates="items")
    product: Mapped["Product"] = relationship("Product")

