"""
User Schemas
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


# --- Auth Schemas ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2, max_length=100)
    phone: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """Respuesta de login con token y datos del usuario"""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class TokenData(BaseModel):
    user_id: int | None = None
    email: str | None = None
    role: UserRole | None = None


# --- User Schemas ---

class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    phone: str | None = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    phone: str | None
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserAdminUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    phone: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


# Resolver forward references para Pydantic v2
LoginResponse.model_rebuild()

