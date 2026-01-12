"""
Quotes API Routes (Cotizaciones)
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.quote import Quote, QuoteItem
from app.schemas.quote import QuoteCreate, QuoteWithItemsCreate, QuoteResponse
from app.services.email import email_service
from app.utils.dependencies import get_optional_user

router = APIRouter()


async def send_quote_emails(quote_id: int, db: AsyncSession):
    """Background task to send quote emails"""
    async with db.begin():
        result = await db.execute(
            select(Quote).where(Quote.id == quote_id)
        )
        quote = result.scalar_one_or_none()
        
        if quote:
            # Send notification to admin
            await email_service.send_quote_notification(quote)
            # Send confirmation to customer
            await email_service.send_quote_confirmation(quote)


@router.post("", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_quote(
    quote_data: QuoteCreate,
    background_tasks: BackgroundTasks,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new quote request (sin items)"""
    quote = Quote(
        user_id=current_user.id if current_user else None,
        name=quote_data.name,
        email=quote_data.email,
        phone=quote_data.phone,
        vehicle_info=quote_data.vehicle_info,
        message=quote_data.message,
    )
    db.add(quote)
    await db.commit()
    await db.refresh(quote)
    
    # Send emails in background
    background_tasks.add_task(
        email_service.send_quote_notification, 
        quote
    )
    background_tasks.add_task(
        email_service.send_quote_confirmation,
        quote
    )
    
    return QuoteResponse.model_validate(quote)


@router.post("/whatsapp", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_quote_whatsapp(
    quote_data: QuoteWithItemsCreate,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new quote with items (para cotización por WhatsApp)"""
    # Crear la cotización
    quote = Quote(
        user_id=current_user.id if current_user else None,
        name=quote_data.name,
        email=quote_data.email,
        phone=quote_data.phone,
        vehicle_info=quote_data.vehicle_info,
        message=quote_data.message or "",
        sent_via_whatsapp=quote_data.sent_via_whatsapp,
    )
    db.add(quote)
    await db.flush()  # Para obtener el ID
    
    # Agregar items
    for item_data in quote_data.items:
        quote_item = QuoteItem(
            quote_id=quote.id,
            product_id=item_data.product_id,
            product_code=item_data.product_code,
            product_name=item_data.product_name,
            quantity=item_data.quantity,
        )
        db.add(quote_item)
    
    await db.commit()
    
    # Recargar con items
    result = await db.execute(
        select(Quote)
        .options(selectinload(Quote.items))
        .where(Quote.id == quote.id)
    )
    quote = result.scalar_one()
    
    return QuoteResponse.model_validate(quote)


@router.get("/my-quotes", response_model=list[QuoteResponse])
async def get_my_quotes(
    current_user: User = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's quotes"""
    if not current_user:
        return []
    
    result = await db.execute(
        select(Quote)
        .options(selectinload(Quote.items))
        .where(Quote.user_id == current_user.id)
        .order_by(Quote.created_at.desc())
    )
    quotes = result.scalars().all()
    
    return [QuoteResponse.model_validate(q) for q in quotes]

