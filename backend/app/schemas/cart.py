"""
Cart Schemas
"""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class ProductInCart(BaseModel):
    id: int
    name: str
    code: str
    brand: str
    price: Decimal
    original_price: Decimal | None
    stock: int
    image_url: str | None
    in_stock: bool

    class Config:
        from_attributes = True


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product: ProductInCart
    quantity: int
    subtotal: Decimal  # price * quantity
    created_at: datetime

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    items_count: int
    subtotal: Decimal
    shipping_estimate: Decimal
    total: Decimal

