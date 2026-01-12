"""
Security utilities for JWT and password hashing
"""
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from app.config import settings
from app.schemas.user import TokenData
from app.models.user import UserRole


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )


def get_password_hash(password: str) -> str:
    """Hash a password"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def create_access_token(
    data: dict, 
    expires_delta: timedelta | None = None
) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> TokenData | None:
    """Decode and validate a JWT token"""
    try:
        # Deshabilitar validación estricta de 'sub' para compatibilidad
        # (JWT spec dice que sub debe ser string, pero algunos tokens pueden tener int)
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={"verify_sub": False}
        )
        # sub puede ser string o int, convertir a int
        sub = payload.get("sub")
        if sub is None:
            return None
        user_id = int(sub) if isinstance(sub, str) else sub
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if user_id is None:
            return None
            
        return TokenData(
            user_id=user_id, 
            email=email, 
            role=UserRole(role) if role else None
        )
    except (JWTError, ValueError, TypeError):
        return None
