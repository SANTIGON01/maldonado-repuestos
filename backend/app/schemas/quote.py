"""
Quote Schemas
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.quote import QuoteStatus


# --- Item Schemas ---
class QuoteItemCreate(BaseModel):
    """Item para crear cotización"""
    product_id: int
    product_code: str
    product_name: str
    quantity: int = Field(ge=1, default=1)


class QuoteItemResponse(BaseModel):
    """Item en respuesta de cotización"""
    id: int
    product_id: int
    product_code: str
    product_name: str
    quantity: int

    class Config:
        from_attributes = True


# --- Quote Schemas ---
class QuoteCreate(BaseModel):
    """Crear cotización simple (sin items)"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=8, max_length=50)
    vehicle_info: str | None = Field(None, max_length=200)
    message: str = Field(..., min_length=10)


class QuoteWithItemsCreate(BaseModel):
    """Crear cotización con items (para WhatsApp)"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=8, max_length=50)
    vehicle_info: str | None = Field(None, max_length=200)
    message: str | None = Field(None, max_length=500)
    items: list[QuoteItemCreate] = Field(..., min_length=1)
    sent_via_whatsapp: bool = True


class QuoteUpdate(BaseModel):
    status: QuoteStatus | None = None
    admin_notes: str | None = None


class QuoteResponse(BaseModel):
    id: int
    user_id: int | None
    name: str
    email: str
    phone: str
    vehicle_info: str | None
    message: str | None
    sent_via_whatsapp: bool
    status: QuoteStatus
    admin_notes: str | None
    created_at: datetime
    updated_at: datetime
    responded_at: datetime | None
    items: list[QuoteItemResponse] = []

    class Config:
        from_attributes = True


class QuoteListResponse(BaseModel):
    items: list[QuoteResponse]
    total: int
    page: int
    page_size: int

