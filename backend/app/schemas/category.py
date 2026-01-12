"""
Category Schemas
"""
from datetime import datetime
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: str | None = None
    icon: str | None = None
    image_url: str | None = None
    is_active: bool = True
    display_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    slug: str | None = Field(None, min_length=2, max_length=100)
    description: str | None = None
    icon: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    display_order: int | None = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    products_count: int = 0

    class Config:
        from_attributes = True

