"""
Categories API Routes (Public)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryResponse

router = APIRouter()


@router.get("", response_model=list[CategoryResponse])
async def list_categories(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """List all categories with product count"""
    query = select(Category)
    
    if active_only:
        query = query.where(Category.is_active == True)
    
    query = query.order_by(Category.display_order, Category.name)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    # Get product counts
    response = []
    for cat in categories:
        count_result = await db.execute(
            select(func.count(Product.id))
            .where(Product.category_id == cat.id)
            .where(Product.is_active == True)
        )
        count = count_result.scalar() or 0
        
        response.append(CategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            icon=cat.icon,
            image_url=cat.image_url,
            is_active=cat.is_active,
            display_order=cat.display_order,
            created_at=cat.created_at,
            products_count=count,
        ))
    
    return response


@router.get("/{slug}", response_model=CategoryResponse)
async def get_category(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a category by slug"""
    result = await db.execute(
        select(Category).where(Category.slug == slug)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    
    # Get product count
    count_result = await db.execute(
        select(func.count(Product.id))
        .where(Product.category_id == category.id)
        .where(Product.is_active == True)
    )
    count = count_result.scalar() or 0
    
    return CategoryResponse(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        icon=category.icon,
        image_url=category.image_url,
        is_active=category.is_active,
        display_order=category.display_order,
        created_at=category.created_at,
        products_count=count,
    )

