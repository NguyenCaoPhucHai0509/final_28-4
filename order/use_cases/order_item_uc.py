from fastapi import HTTPException
from sqlmodel import Session

from ..models.order_items import OrderItemStatus
from ..models.orders import Order

def are_all_order_items_of_order_ready(order_db: Order):
    for order_item in order_db.order_items:
        if (order_item.status == OrderItemStatus.pending 
            or order_item.status == OrderItemStatus.preparing):
            return False
    return True
