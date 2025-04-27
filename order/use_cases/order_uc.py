from fastapi import HTTPException
from sqlmodel import Session

from ..models.orders import Order, OrderCreate
from ..models.order_items import OrderItem
from ..utils import restaurant_utils


async def get_order_with_check_involvement(
    session: Session,
    current_user: dict,
    order_id: int
):
    # Get order_db by id
    order_db = session.get(Order, order_id)
    if not order_db:
        raise HTTPException(status_code=404, detail="Order not found")


    role, user_id = current_user["role"], current_user["id"]

    # For user's role is customer
    is_related_customer = bool(role == "customer" and user_id == order_db.customer_id)
    
    # request to Delivery Service
    is_related_driver = True

    if not (is_related_customer or is_related_driver):
        raise HTTPException(status_code=400, detail="You don't involve this order")
    
    return order_db
        