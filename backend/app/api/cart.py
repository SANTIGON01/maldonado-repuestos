"""
Cart API Routes
"""
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.cart import CartItem
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse, ProductInCart
from app.utils.dependencies import get_current_active_user

router = APIRouter()


@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's cart"""
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .options(selectinload(CartItem.product))
        .order_by(CartItem.created_at.desc())
    )
    cart_items = result.scalars().all()
    
    items = []
    subtotal = Decimal("0.00")
    
    for item in cart_items:
        product = item.product
        item_subtotal = product.price * item.quantity
        subtotal += item_subtotal
        
        items.append(CartItemResponse(
            id=item.id,
            product_id=item.product_id,
            product=ProductInCart(
                id=product.id,
                name=product.name,
                code=product.code,
                brand=product.brand,
                price=product.price,
                original_price=product.original_price,
                stock=product.stock,
                image_url=product.image_url,
                in_stock=product.in_stock,
            ),
            quantity=item.quantity,
            subtotal=item_subtotal,
            created_at=item.created_at,
        ))
    
    # Simple shipping estimate (free over 100,000 ARS)
    shipping_estimate = Decimal("0.00") if subtotal >= 100000 else Decimal("5000.00")
    total = subtotal + shipping_estimate
    
    return CartResponse(
        items=items,
        items_count=len(items),
        subtotal=subtotal,
        shipping_estimate=shipping_estimate,
        total=total,
    )


@router.post("/add", response_model=CartItemResponse)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a product to cart"""
    # Check if product exists and is active
    product_result = await db.execute(
        select(Product).where(Product.id == item_data.product_id)
    )
    product = product_result.scalar_one_or_none()
    
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    # Check stock
    if product.stock < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. Disponible: {product.stock}"
        )
    
    # Check if already in cart
    existing_result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .where(CartItem.product_id == item_data.product_id)
    )
    existing_item = existing_result.scalar_one_or_none()
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + item_data.quantity
        if product.stock < new_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Disponible: {product.stock}"
            )
        existing_item.quantity = new_quantity
        cart_item = existing_item
    else:
        # Create new cart item
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
        )
        db.add(cart_item)
    
    await db.commit()
    await db.refresh(cart_item)
    
    item_subtotal = product.price * cart_item.quantity
    
    return CartItemResponse(
        id=cart_item.id,
        product_id=cart_item.product_id,
        product=ProductInCart(
            id=product.id,
            name=product.name,
            code=product.code,
            brand=product.brand,
            price=product.price,
            original_price=product.original_price,
            stock=product.stock,
            image_url=product.image_url,
            in_stock=product.in_stock,
        ),
        quantity=cart_item.quantity,
        subtotal=item_subtotal,
        created_at=cart_item.created_at,
    )


@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update cart item quantity"""
    result = await db.execute(
        select(CartItem)
        .where(CartItem.id == item_id)
        .where(CartItem.user_id == current_user.id)
        .options(selectinload(CartItem.product))
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado en el carrito"
        )
    
    product = cart_item.product
    
    # Check stock
    if product.stock < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. Disponible: {product.stock}"
        )
    
    cart_item.quantity = item_data.quantity
    await db.commit()
    await db.refresh(cart_item)
    
    item_subtotal = product.price * cart_item.quantity
    
    return CartItemResponse(
        id=cart_item.id,
        product_id=cart_item.product_id,
        product=ProductInCart(
            id=product.id,
            name=product.name,
            code=product.code,
            brand=product.brand,
            price=product.price,
            original_price=product.original_price,
            stock=product.stock,
            image_url=product.image_url,
            in_stock=product.in_stock,
        ),
        quantity=cart_item.quantity,
        subtotal=item_subtotal,
        created_at=cart_item.created_at,
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove an item from cart"""
    result = await db.execute(
        select(CartItem)
        .where(CartItem.id == item_id)
        .where(CartItem.user_id == current_user.id)
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado en el carrito"
        )
    
    await db.delete(cart_item)
    await db.commit()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear entire cart"""
    await db.execute(
        delete(CartItem).where(CartItem.user_id == current_user.id)
    )
    await db.commit()

