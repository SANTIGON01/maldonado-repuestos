"""
Products API Routes (Public)
Optimizado con cache headers para mejor rendimiento
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductResponse, ProductListResponse, ProductImageResponse

router = APIRouter()


def product_to_response(p: Product) -> ProductResponse:
    """Helper para convertir Product model a ProductResponse"""
    return ProductResponse(
        id=p.id,
        category_id=p.category_id,
        category=p.category,
        name=p.name,
        code=p.code,
        brand=p.brand,
        description=p.description,
        price=p.price,
        original_price=p.original_price,
        stock=p.stock,
        image_url=p.image_url,
        images=[ProductImageResponse.model_validate(img) for img in (p.images or [])],
        is_active=p.is_active,
        is_featured=p.is_featured,
        is_new=p.is_new,
        rating=p.rating,
        reviews_count=p.reviews_count,
        in_stock=p.in_stock,
        discount_percent=p.discount_percent,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


@router.get("", response_model=ProductListResponse)
async def list_products(
    response: Response,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=1000),
    category_id: int | None = None,
    category_slug: str | None = None,
    brand: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    in_stock: bool | None = None,
    featured: bool | None = None,
    is_new: bool | None = None,
    sort_by: str = Query("created_at", enum=["created_at", "price", "name", "rating"]),
    sort_order: str = Query("desc", enum=["asc", "desc"]),
    db: AsyncSession = Depends(get_db)
):
    """List products with filters and pagination"""
    # Cache por 1 minuto (datos que pueden cambiar)
    response.headers["Cache-Control"] = "public, max-age=60"
    
    query = select(Product).where(Product.is_active == True)
    
    # Category filter
    if category_id:
        query = query.where(Product.category_id == category_id)
    elif category_slug:
        cat_result = await db.execute(
            select(Category.id).where(Category.slug == category_slug)
        )
        cat_id = cat_result.scalar_one_or_none()
        if cat_id:
            query = query.where(Product.category_id == cat_id)
    
    # Brand filter
    if brand:
        query = query.where(Product.brand.ilike(f"%{brand}%"))
    
    # Price filters
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    
    # Stock filter
    if in_stock is True:
        query = query.where(Product.stock > 0)
    elif in_stock is False:
        query = query.where(Product.stock == 0)
    
    # Featured filter
    if featured is not None:
        query = query.where(Product.is_featured == featured)
    
    # New filter
    if is_new is not None:
        query = query.where(Product.is_new == is_new)
    
    # Sorting
    sort_column = getattr(Product, sort_by)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    query = query.options(
        selectinload(Product.category),
        selectinload(Product.images)
    )
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    items = [product_to_response(p) for p in products]
    
    total_pages = (total + page_size - 1) // page_size
    
    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/search", response_model=ProductListResponse)
async def search_products(
    q: str = Query(..., min_length=2),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=1000),
    category_id: int | None = None,
    category_slug: str | None = None,
    brand: str | None = None,
    in_stock: bool | None = None,
    sort_by: str = Query("name", enum=["created_at", "price", "name", "rating"]),
    sort_order: str = Query("asc", enum=["asc", "desc"]),
    db: AsyncSession = Depends(get_db)
):
    """Search products by name, code, or brand with additional filters"""
    search_term = f"%{q}%"

    query = (
        select(Product)
        .where(Product.is_active == True)
        .where(
            or_(
                Product.name.ilike(search_term),
                Product.code.ilike(search_term),
                Product.brand.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )
    )

    # Category filter
    if category_id:
        query = query.where(Product.category_id == category_id)
    elif category_slug:
        cat_result = await db.execute(
            select(Category.id).where(Category.slug == category_slug)
        )
        cat_id = cat_result.scalar_one_or_none()
        if cat_id:
            query = query.where(Product.category_id == cat_id)

    # Brand filter
    if brand:
        query = query.where(Product.brand.ilike(f"%{brand}%"))

    # Stock filter
    if in_stock is True:
        query = query.where(Product.stock > 0)
    elif in_stock is False:
        query = query.where(Product.stock == 0)

    # Sorting
    sort_column = getattr(Product, sort_by)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    query = query.options(
        selectinload(Product.category),
        selectinload(Product.images)
    )
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    items = [product_to_response(p) for p in products]
    
    total_pages = (total + page_size - 1) // page_size
    
    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a product by ID"""
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(
            selectinload(Product.category),
            selectinload(Product.images)
        )
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    return product_to_response(product)


@router.get("/code/{code}", response_model=ProductResponse)
async def get_product_by_code(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a product by code"""
    result = await db.execute(
        select(Product)
        .where(Product.code == code)
        .options(
            selectinload(Product.category),
            selectinload(Product.images)
        )
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    return product_to_response(product)

