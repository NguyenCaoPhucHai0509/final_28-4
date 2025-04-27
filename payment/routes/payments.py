from fastapi import Depends, Path, Body, HTTPException
from fastapi.routing import APIRouter
import redis.asyncio as redis
import json
from sqlmodel import Session
from datetime import datetime

from ..models.payments import Payment, PaymentStatus, PaymentMethod
from ..database import get_session
from ..utils.auth_utils import get_current_active_user

router = APIRouter()

redis_client = redis.Redis()

@router.post("/test")
async def create_payment(
    session: Session = Depends(get_session),
):
    payment_db = Payment(
        order_id=20,
        customer_id=6,
        order_total_amount=14.50,
        shipping_fee=24071.6,
        final_amount=14.50 + 24071.6
    )
    session.add(payment_db)
    session.commit()
    session.refresh(payment_db)
    return payment_db

@router.get("/{order_id}")
async def get_payment(
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_active_user),
    order_id: int = Path()
):
    payment_db = session.get(Payment, order_id)
    
    if not payment_db:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if current_user["id"] != payment_db.customer_id:
        raise HTTPException(status_code=400, detail="You don't own this order")
    
    return payment_db

@router.patch("/{order_id}/pay")
async def complete_payment(
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_active_user),
    order_id: int = Path(),
    payment_method: PaymentMethod = Body(embed=True)
):
    payment_db = session.get(Payment, order_id)
    
    if not payment_db:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if current_user["id"] != payment_db.customer_id:
        raise HTTPException(status_code=400, detail="You don't own this order")
    
    payment_db.status = PaymentStatus.completed
    payment_db.payment_method = payment_method
    payment_db.last_updated_at = datetime.now()

    session.add(payment_db)
    session.commit()
    session.refresh(payment_db)

    channel = "order.preparing"
    data = {
        "order_id": payment_db.order_id
    }
    print(f"DATA: {data}")

    await redis_client.publish(channel, json.dumps(data))

    return payment_db