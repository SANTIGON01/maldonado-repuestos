"""
Order Schemas
"""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.order import OrderStatus


class ShippingInfo(BaseModel):
    shipping_name: str = Field(..., min_length=2, max_length=200)
    shipping_address: str = Field(..., min_length=5)
    shipping_city: str = Field(..., min_length=2, max_length=100)
    shipping_state: str = Field(..., min_length=2, max_length=100)
    shipping_zip: str = Field(..., min_length=4, max_length=20)
    shipping_phone: str = Field(..., min_length=8, max_length=50)


class OrderCreate(ShippingInfo):
    notes: str | None = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_code: str
    product_brand: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    order_number: str
    status: OrderStatus
    subtotal: Decimal
    shipping_cost: Decimal
    total: Decimal
    payment_id: str | None
    payment_status: str | None
    shipping_name: str | None
    shipping_address: str | None
    shipping_city: str | None
    shipping_state: str | None
    shipping_zip: str | None
    shipping_phone: str | None
    notes: str | None
    items: list[OrderItemResponse]
    created_at: datetime
    updated_at: datetime
    paid_at: datetime | None
    shipped_at: datetime | None

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: str | None = None

