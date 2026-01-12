"""
Orders API Routes
"""
import uuid
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.cart import CartItem
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderCreate, OrderResponse, OrderItemResponse, OrderListResponse
from app.utils.dependencies import get_current_active_user

router = APIRouter()


def generate_order_number() -> str:
    """Generate a unique order number"""
    return f"MR-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an order from current cart"""
    # Get cart items
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .options(selectinload(CartItem.product))
    )
    cart_items = result.scalars().all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El carrito está vacío"
        )
    
    # Validate stock and calculate totals
    subtotal = Decimal("0.00")
    order_items_data = []
    
    for cart_item in cart_items:
        product = cart_item.product
        
        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El producto '{product.name}' ya no está disponible"
            )
        
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para '{product.name}'. Disponible: {product.stock}"
            )
        
        item_total = product.price * cart_item.quantity
        subtotal += item_total
        
        order_items_data.append({
            "product_id": product.id,
            "product_name": product.name,
            "product_code": product.code,
            "product_brand": product.brand,
            "quantity": cart_item.quantity,
            "unit_price": product.price,
            "total_price": item_total,
        })
    
    # Calculate shipping (free over 100,000 ARS)
    shipping_cost = Decimal("0.00") if subtotal >= 100000 else Decimal("5000.00")
    total = subtotal + shipping_cost
    
    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=generate_order_number(),
        status=OrderStatus.PENDING,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total=total,
        shipping_name=order_data.shipping_name,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_state=order_data.shipping_state,
        shipping_zip=order_data.shipping_zip,
        shipping_phone=order_data.shipping_phone,
        notes=order_data.notes,
    )
    db.add(order)
    await db.flush()  # Get order ID
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            **item_data
        )
        db.add(order_item)
    
    # Update product stock
    for cart_item in cart_items:
        cart_item.product.stock -= cart_item.quantity
    
    # Clear cart
    await db.execute(
        delete(CartItem).where(CartItem.user_id == current_user.id)
    )
    
    await db.commit()
    await db.refresh(order)
    
    # Load items
    result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    items = result.scalars().all()
    
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
        items=[OrderItemResponse.model_validate(i) for i in items],
        created_at=order.created_at,
        updated_at=order.updated_at,
        paid_at=order.paid_at,
        shipped_at=order.shipped_at,
    )


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's orders"""
    query = (
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    
    # Get total
    count_result = await db.execute(
        select(func.count(Order.id)).where(Order.user_id == current_user.id)
    )
    total = count_result.scalar() or 0
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).options(selectinload(Order.items))
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    items = []
    for order in orders:
        items.append(OrderResponse(
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
        ))
    
    return OrderListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order details"""
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .where(Order.user_id == current_user.id)
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )
    
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

