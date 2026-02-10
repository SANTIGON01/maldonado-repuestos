"""
Admin API Routes
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.order import Order, OrderStatus
from app.models.quote import Quote, QuoteStatus
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse, ProductImageResponse
from app.schemas.order import OrderResponse, OrderListResponse, OrderStatusUpdate, OrderItemResponse
from app.schemas.quote import QuoteUpdate, QuoteResponse, QuoteListResponse
from app.schemas.user import UserResponse, UserAdminUpdate
from app.utils.dependencies import get_admin_user

router = APIRouter()


# --- Dashboard Stats ---

class DashboardStats(BaseModel):
    total_products: int
    total_orders: int
    total_users: int
    total_quotes: int
    pending_orders: int
    pending_quotes: int
    total_revenue: float
    orders_today: int


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics"""
    # Products count
    products_result = await db.execute(select(func.count(Product.id)))
    total_products = products_result.scalar() or 0
    
    # Orders count
    orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = orders_result.scalar() or 0
    
    # Users count
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar() or 0
    
    # Quotes count
    quotes_result = await db.execute(select(func.count(Quote.id)))
    total_quotes = quotes_result.scalar() or 0
    
    # Pending orders
    pending_orders_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.status.in_([OrderStatus.PENDING, OrderStatus.PAYMENT_PENDING, OrderStatus.PAID]))
    )
    pending_orders = pending_orders_result.scalar() or 0
    
    # Pending quotes
    pending_quotes_result = await db.execute(
        select(func.count(Quote.id)).where(Quote.status == QuoteStatus.PENDING)
    )
    pending_quotes = pending_quotes_result.scalar() or 0
    
    # Total revenue (from paid orders)
    revenue_result = await db.execute(
        select(func.sum(Order.total)).where(Order.status == OrderStatus.PAID)
    )
    total_revenue = float(revenue_result.scalar() or 0)
    
    # Orders today
    today = datetime.utcnow().date()
    orders_today_result = await db.execute(
        select(func.count(Order.id))
        .where(func.date(Order.created_at) == today)
    )
    orders_today = orders_today_result.scalar() or 0
    
    return DashboardStats(
        total_products=total_products,
        total_orders=total_orders,
        total_users=total_users,
        total_quotes=total_quotes,
        pending_orders=pending_orders,
        pending_quotes=pending_quotes,
        total_revenue=total_revenue,
        orders_today=orders_today,
    )


# --- Categories Management ---

@router.get("/categories", response_model=list[CategoryResponse])
async def admin_list_categories(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all categories (including inactive)"""
    result = await db.execute(
        select(Category).order_by(Category.display_order, Category.name)
    )
    categories = result.scalars().all()
    
    response = []
    for cat in categories:
        count_result = await db.execute(
            select(func.count(Product.id)).where(Product.category_id == cat.id)
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


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new category"""
    # Check slug uniqueness
    result = await db.execute(
        select(Category).where(Category.slug == category_data.slug)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una categoría con ese slug"
        )
    
    category = Category(**category_data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
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
        products_count=0,
    )


@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a category"""
    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    
    # Check slug uniqueness if changing
    if category_data.slug and category_data.slug != category.slug:
        slug_result = await db.execute(
            select(Category).where(Category.slug == category_data.slug)
        )
        if slug_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una categoría con ese slug"
            )
    
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    await db.commit()
    await db.refresh(category)
    
    count_result = await db.execute(
        select(func.count(Product.id)).where(Product.category_id == category.id)
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


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a category"""
    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    
    # Check for products
    products_result = await db.execute(
        select(func.count(Product.id)).where(Product.category_id == category_id)
    )
    if products_result.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar una categoría con productos"
        )
    
    await db.delete(category)
    await db.commit()


# --- Products Management ---

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
        is_on_promotion=p.is_on_promotion,
        rating=p.rating,
        reviews_count=p.reviews_count,
        in_stock=p.in_stock,
        discount_percent=p.discount_percent,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


@router.get("/products", response_model=ProductListResponse)
async def admin_list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: int | None = None,
    search: str | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all products (including inactive)"""
    query = select(Product)
    
    if category_id:
        query = query.where(Product.category_id == category_id)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            Product.name.ilike(search_term) | 
            Product.code.ilike(search_term) |
            Product.brand.ilike(search_term)
        )
    
    query = query.order_by(Product.created_at.desc())
    
    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).options(
        selectinload(Product.category),
        selectinload(Product.images)
    )
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    items = [product_to_response(p) for p in products]
    
    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new product"""
    # Check category exists
    cat_result = await db.execute(
        select(Category).where(Category.id == product_data.category_id)
    )
    if not cat_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoría no encontrada"
        )
    
    # Check code uniqueness
    code_result = await db.execute(
        select(Product).where(Product.code == product_data.code)
    )
    if code_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un producto con ese código"
        )
    
    # Extraer imágenes del request
    images_data = product_data.images
    product_dict = product_data.model_dump(exclude={'images'})
    
    product = Product(**product_dict)
    db.add(product)
    await db.flush()  # Para obtener el ID
    
    # Agregar imágenes si las hay
    if images_data:
        for idx, img_data in enumerate(images_data):
            product_image = ProductImage(
                product_id=product.id,
                image_url=img_data.image_url,
                display_order=img_data.display_order or idx,
                is_primary=img_data.is_primary,
                alt_text=img_data.alt_text,
            )
            db.add(product_image)
    
    await db.commit()
    
    # Recargar con relaciones
    result = await db.execute(
        select(Product)
        .where(Product.id == product.id)
        .options(selectinload(Product.category), selectinload(Product.images))
    )
    product = result.scalar_one()
    
    return product_to_response(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a product"""
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.images))
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    # Check code uniqueness if changing
    if product_data.code and product_data.code != product.code:
        code_result = await db.execute(
            select(Product).where(Product.code == product_data.code)
        )
        if code_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un producto con ese código"
            )
    
    # Extraer imágenes del update
    images_data = product_data.images
    update_data = product_data.model_dump(exclude_unset=True, exclude={'images'})
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    # Si se envían imágenes, reemplazar todas las existentes
    if images_data is not None:
        # Eliminar imágenes existentes
        await db.execute(
            delete(ProductImage).where(ProductImage.product_id == product_id)
        )
        
        # Agregar nuevas imágenes
        for idx, img_data in enumerate(images_data):
            product_image = ProductImage(
                product_id=product_id,
                image_url=img_data.image_url,
                display_order=img_data.display_order or idx,
                is_primary=img_data.is_primary,
                alt_text=img_data.alt_text,
            )
            db.add(product_image)
    
    await db.commit()
    
    # Recargar con relaciones
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.category), selectinload(Product.images))
    )
    product = result.scalar_one()
    
    return product_to_response(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a product"""
    # Verificar que el producto existe
    result = await db.execute(
        select(Product.id).where(Product.id == product_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    # Eliminar imágenes del producto primero
    await db.execute(
        delete(ProductImage).where(ProductImage.product_id == product_id)
    )
    
    # Eliminar items del carrito relacionados
    from app.models.cart import CartItem
    await db.execute(
        delete(CartItem).where(CartItem.product_id == product_id)
    )
    
    # Poner NULL en order_items y quote_items (mantiene historial)
    from app.models.order import OrderItem
    from app.models.quote import QuoteItem
    from sqlalchemy import update
    
    await db.execute(
        update(OrderItem).where(OrderItem.product_id == product_id).values(product_id=None)
    )
    await db.execute(
        update(QuoteItem).where(QuoteItem.product_id == product_id).values(product_id=None)
    )
    
    # Finalmente eliminar el producto
    await db.execute(
        delete(Product).where(Product.id == product_id)
    )
    
    await db.commit()


# --- Orders Management ---

@router.get("/orders", response_model=OrderListResponse)
async def admin_list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: OrderStatus | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all orders"""
    query = select(Order)
    
    if status_filter:
        query = query.where(Order.status == status_filter)
    
    query = query.order_by(Order.created_at.desc())
    
    # Count
    count_query = select(func.count(Order.id))
    if status_filter:
        count_query = count_query.where(Order.status == status_filter)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).options(selectinload(Order.items))
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    items = [
        OrderResponse(
            id=o.id,
            user_id=o.user_id,
            order_number=o.order_number,
            status=o.status,
            subtotal=o.subtotal,
            shipping_cost=o.shipping_cost,
            total=o.total,
            payment_id=o.payment_id,
            payment_status=o.payment_status,
            shipping_name=o.shipping_name,
            shipping_address=o.shipping_address,
            shipping_city=o.shipping_city,
            shipping_state=o.shipping_state,
            shipping_zip=o.shipping_zip,
            shipping_phone=o.shipping_phone,
            notes=o.notes,
            items=[OrderItemResponse.model_validate(i) for i in o.items],
            created_at=o.created_at,
            updated_at=o.updated_at,
            paid_at=o.paid_at,
            shipped_at=o.shipped_at,
        )
        for o in orders
    ]
    
    return OrderListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )
    
    order.status = status_data.status
    if status_data.notes:
        order.notes = (order.notes or "") + f"\n[Admin] {status_data.notes}"
    
    if status_data.status == OrderStatus.SHIPPED:
        order.shipped_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(order)
    
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        order_number=order.order_number,
        status=order.status,
        subtotal=order.subtotal,
        shipping_cost=order.shipping_cost,
        total=order.total,
        payment_id=order.payment_id,
        payment_status=order.payment_status,
        shipping_name=order.shipping_name,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_state=order.shipping_state,
        shipping_zip=order.shipping_zip,
        shipping_phone=order.shipping_phone,
        notes=order.notes,
        items=[OrderItemResponse.model_validate(i) for i in order.items],
        created_at=order.created_at,
        updated_at=order.updated_at,
        paid_at=order.paid_at,
        shipped_at=order.shipped_at,
    )


# --- Quotes Management ---

@router.get("/quotes", response_model=QuoteListResponse)
async def admin_list_quotes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: QuoteStatus | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all quotes"""
    query = select(Quote)
    
    if status_filter:
        query = query.where(Quote.status == status_filter)
    
    query = query.order_by(Quote.created_at.desc())
    
    # Count
    count_query = select(func.count(Quote.id))
    if status_filter:
        count_query = count_query.where(Quote.status == status_filter)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    quotes = result.scalars().all()
    
    return QuoteListResponse(
        items=[QuoteResponse.model_validate(q) for q in quotes],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.put("/quotes/{quote_id}", response_model=QuoteResponse)
async def update_quote(
    quote_id: int,
    quote_data: QuoteUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update quote status"""
    result = await db.execute(
        select(Quote).where(Quote.id == quote_id)
    )
    quote = result.scalar_one_or_none()
    
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cotización no encontrada"
        )
    
    if quote_data.status:
        quote.status = quote_data.status
        if quote_data.status in [QuoteStatus.CONTACTED, QuoteStatus.QUOTED]:
            quote.responded_at = datetime.utcnow()
    
    if quote_data.admin_notes:
        quote.admin_notes = quote_data.admin_notes
    
    await db.commit()
    await db.refresh(quote)
    
    return QuoteResponse.model_validate(quote)


# --- Users Management ---

@router.get("/users", response_model=list[UserResponse])
async def admin_list_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all users"""
    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: int,
    user_data: UserAdminUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a user (admin)"""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)

