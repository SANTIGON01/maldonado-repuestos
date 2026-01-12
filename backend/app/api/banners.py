"""
Banner API Routes
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.banner import Banner
from app.models.user import User
from app.schemas.banner import BannerCreate, BannerUpdate, BannerResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/banners", tags=["banners"])


@router.get("", response_model=list[BannerResponse])
async def get_banners(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Get all banners (públicos - solo activos y vigentes)"""
    query = select(Banner).order_by(Banner.order, Banner.created_at.desc())
    
    if active_only:
        query = query.where(Banner.is_active == True)
        # Filtrar por fechas de vigencia
        now = datetime.utcnow()
        query = query.where(
            (Banner.start_date == None) | (Banner.start_date <= now)
        ).where(
            (Banner.end_date == None) | (Banner.end_date >= now)
        )
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/all", response_model=list[BannerResponse])
async def get_all_banners(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all banners including inactive (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden ver todos los banners"
        )
    
    result = await db.execute(
        select(Banner).order_by(Banner.order, Banner.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{banner_id}", response_model=BannerResponse)
async def get_banner(banner_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific banner"""
    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    banner = result.scalar_one_or_none()
    
    if not banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    
    return banner


@router.post("", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
async def create_banner(
    banner_data: BannerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new banner (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden crear banners"
        )
    
    banner = Banner(**banner_data.model_dump())
    db.add(banner)
    await db.commit()
    await db.refresh(banner)
    
    return banner


@router.put("/{banner_id}", response_model=BannerResponse)
async def update_banner(
    banner_id: int,
    banner_data: BannerUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a banner (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden actualizar banners"
        )
    
    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    banner = result.scalar_one_or_none()
    
    if not banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    
    update_data = banner_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(banner, field, value)
    
    await db.commit()
    await db.refresh(banner)
    
    return banner


@router.delete("/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_banner(
    banner_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a banner (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden eliminar banners"
        )
    
    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    banner = result.scalar_one_or_none()
    
    if not banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    
    await db.delete(banner)
    await db.commit()

