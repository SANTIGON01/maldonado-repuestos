"""
Payments API Routes (MercadoPago)
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.services.mercadopago import mercadopago_service
from app.utils.dependencies import get_current_active_user

router = APIRouter()


class PaymentPreferenceResponse(BaseModel):
    preference_id: str
    init_point: str  # URL to redirect user to MercadoPago
    sandbox_init_point: str  # Sandbox URL for testing


class WebhookPayload(BaseModel):
    id: int | None = None
    type: str | None = None
    data: dict | None = None


@router.post("/create-preference/{order_id}", response_model=PaymentPreferenceResponse)
async def create_payment_preference(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create MercadoPago payment preference for an order"""
    # Get order
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
    
    if order.status not in [OrderStatus.PENDING, OrderStatus.PAYMENT_PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este pedido no puede ser pagado"
        )
    
    # Prepare items for MercadoPago
    items = [
        {
            "product_id": item.product_id,
            "name": item.product_name,
            "brand": item.product_brand,
            "code": item.product_code,
            "quantity": item.quantity,
            "price": item.unit_price,
        }
        for item in order.items
    ]
    
    try:
        preference = mercadopago_service.create_preference(order, items)
        
        # Update order status
        order.status = OrderStatus.PAYMENT_PENDING
        await db.commit()
        
        return PaymentPreferenceResponse(
            preference_id=preference["id"],
            init_point=preference["init_point"],
            sandbox_init_point=preference.get("sandbox_init_point", preference["init_point"]),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear preferencia de pago: {str(e)}"
        )


@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle MercadoPago webhook notifications"""
    try:
        data = await request.json()
        
        payment = mercadopago_service.process_webhook(data)
        
        if payment:
            external_reference = payment.get("external_reference")
            payment_status = payment.get("status")
            payment_id = str(payment.get("id"))
            
            if external_reference:
                # Find order by order_number
                result = await db.execute(
                    select(Order).where(Order.order_number == external_reference)
                )
                order = result.scalar_one_or_none()
                
                if order:
                    order.payment_id = payment_id
                    order.payment_status = payment_status
                    
                    # Update order status based on payment status
                    if payment_status == "approved":
                        order.status = OrderStatus.PAID
                        order.paid_at = datetime.utcnow()
                    elif payment_status in ["rejected", "cancelled"]:
                        order.status = OrderStatus.CANCELLED
                    elif payment_status == "pending":
                        order.status = OrderStatus.PAYMENT_PENDING
                    
                    await db.commit()
        
        return {"status": "ok"}
    except Exception as e:
        # Log error but return 200 to avoid MercadoPago retries
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/status/{order_id}")
async def get_payment_status(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get payment status for an order"""
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .where(Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )
    
    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "order_status": order.status.value,
        "payment_id": order.payment_id,
        "payment_status": order.payment_status,
        "paid_at": order.paid_at,
    }

