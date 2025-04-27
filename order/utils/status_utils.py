from fastapi import HTTPException
from sqlmodel import Field

from ..models.orders import OrderStatus
from ..models.order_items import OrderItemStatus


STATUS_CHANGE = {

    "order": {
        OrderStatus.pending: {OrderStatus.preparing},
        OrderStatus.preparing: {OrderStatus.ready_for_delivery},
        OrderStatus.ready_for_delivery: set()
    },

    "order_item": {
        OrderItemStatus.pending: {OrderItemStatus.preparing},
        OrderItemStatus.preparing: {OrderItemStatus.ready},
        OrderItemStatus.ready: set()
        # OrderItemStatus.canceled: set()
    }
}

def validate_status_change(
    current_status: OrderStatus | OrderItemStatus,
    new_status: OrderStatus | OrderItemStatus,
    level: str = Field(description="choose: order or order_item")
):
    
    if new_status not in STATUS_CHANGE[level][current_status]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status transition" +
            f" from {current_status.value} to {new_status.value}"
        )
    