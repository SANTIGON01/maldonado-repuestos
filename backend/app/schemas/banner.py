"""
Banner Schemas
"""
from datetime import datetime
from pydantic import BaseModel


class BannerBase(BaseModel):
    title: str
    subtitle: str | None = None
    description: str | None = None
    image_url: str | None = None
    brand: str | None = None  # Marca del producto (ej: JOST, SUSPENSYS)
    button_text: str | None = None
    button_link: str | None = None
    product_codes: str | None = None
    banner_type: str = 'promo'
    bg_color: str | None = None
    order: int = 0
    is_active: bool = True
    start_date: datetime | None = None
    end_date: datetime | None = None


class BannerCreate(BannerBase):
    pass


class BannerUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    image_url: str | None = None
    brand: str | None = None
    button_text: str | None = None
    button_link: str | None = None
    product_codes: str | None = None
    banner_type: str | None = None
    bg_color: str | None = None
    order: int | None = None
    is_active: bool | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None


class BannerResponse(BannerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

