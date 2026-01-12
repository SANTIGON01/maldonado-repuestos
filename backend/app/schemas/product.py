"""
Product Schemas
"""
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


# === Product Image Schemas ===
class ProductImageBase(BaseModel):
    image_url: str
    display_order: int = 0
    is_primary: bool = False
    alt_text: str | None = None


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageResponse(ProductImageBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# === Product Schemas ===
class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=2, max_length=50)
    brand: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    price: Decimal = Field(..., gt=0)
    original_price: Decimal | None = Field(None, gt=0)
    stock: int = Field(0, ge=0)
    image_url: str | None = None  # Imagen principal (legacy, se mantiene por compatibilidad)
    is_active: bool = True
    is_featured: bool = False
    is_new: bool = False


class ProductCreate(ProductBase):
    category_id: int
    images: list[ProductImageCreate] | None = None  # Imágenes adicionales


class ProductUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = Field(None, min_length=2, max_length=200)
    code: str | None = Field(None, min_length=2, max_length=50)
    brand: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None
    price: Decimal | None = Field(None, gt=0)
    original_price: Decimal | None = None
    stock: int | None = Field(None, ge=0)
    image_url: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    is_new: bool | None = None
    images: list[ProductImageCreate] | None = None  # Reemplaza todas las imágenes


class CategoryInProduct(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    category_id: int
    category: CategoryInProduct | None = None
    name: str
    code: str
    brand: str
    description: str | None
    price: Decimal
    original_price: Decimal | None
    stock: int
    image_url: str | None  # Imagen principal (legacy)
    images: list[ProductImageResponse] = []  # Todas las imágenes
    is_active: bool
    is_featured: bool
    is_new: bool
    rating: Decimal
    reviews_count: int
    in_stock: bool
    discount_percent: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

