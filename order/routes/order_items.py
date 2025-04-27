from fastapi import Depends, Path, Body, Query, HTTPException
from fastapi.routing import APIRouter
from sqlmodel import Session, select
from datetime import datetime

from ..models.orders import OrderStatus
from ..models.order_items import (
    OrderItemPublicV2, OrderItemUpdate, OrderItem, OrderItemStatus
)
import redis.asyncio as redis
import json
from decimal import Decimal
from ..database import get_session
from ..use_cases import order_item_uc
from ..utils import auth_utils, status_utils


router = APIRouter(prefix="/order-items")

redis_client = redis.Redis()


@router.get("/branches/{branch_id}")
async def read_order_items_of_branch(
    session: Session = Depends(get_session),
    branch_id: int = Path(),
    offset: int = Query(default=0),
    limit: int = Query(default=100)
):
    return session.exec(
        select(OrderItem)
        .where(OrderItem.order.branch_id == branch_id)
        .offset(offset).limit(limit)
    ).all()

"""
View an order item
Actor: kitchen staff
"""
@router.get("/{id}")
async def read_order_item(
    session: Session = Depends(get_session),
    id: int = Path()
):
    return session.get(OrderItem, id)


"""
The kitchen staff accepts this order item. Assign this 
order item to a kitchen staff. Currently, don't check wheather
kitchen staff belongs to the restarant in order
Actors: kitchen staff
"""
@router.patch("/{id}/accept", response_model=OrderItemPublicV2)
async def accept_order_item(
    session: Session = Depends(get_session),
    current_user: dict = Depends(auth_utils.require_role(["kitchen_staff"])),
    id: int = Path()
):
    
    # Query order item in database
    order_item_db = session.get(OrderItem, id)

    # Order item not found
    if not order_item_db:
        raise HTTPException(status_code=404, detail="Order item not found")

    # Only accept this order item when its order is paid
    if order_item_db.order.status == OrderStatus.pending:
        raise HTTPException(status_code=400, detail="Order is not paid")
    
    # Not check kitchen staff belongs to order items
 
    order_item_db.sqlmodel_update({
        "kitchen_staff_id": current_user["id"],
        "status": OrderItemStatus.preparing,
        "last_updated_at": datetime.now()
    })
    session.commit()
    session.refresh(order_item_db)
    return order_item_db

"""
Change status of an order item from preparing to ready
Actors: kitchen staff
"""
@router.patch("/{id}/status")
async def change_order_item_status(
    session: Session = Depends(get_session),
    current_kitchen_staff: dict = Depends(auth_utils.get_current_kitchen_staff_info),
    id: int = Path(),
    status: OrderItemStatus = Body(embed=True)
):
    # Query order item in database
    order_item_db = session.get(OrderItem, id)

    # Order item not found
    if not order_item_db:
        raise HTTPException(status_code=404, detail="Order item not found")

    # Check that kitchen staff belongs to this branch 
    if (current_kitchen_staff["branch_id"] != order_item_db.order.branch_id):
        raise HTTPException(
            status_code=400,
            detail="You don't belong to this branch"
        )
    # Check that kitchen staff belongs to this order item
    if (current_kitchen_staff["user_id"] != order_item_db.kitchen_staff_id):
        raise HTTPException(
            status_code=400,
            detail="You don't belong to this order item"
        )
    
    print(f"CURRENT STATUS: {order_item_db.status}")

    # Check status change, it will raise error if invalid
    status_utils.validate_status_change(
        order_item_db.status, 
        status, 
        level="order_item"
    )
    
    order_item_db.status = status
    session.add(order_item_db)
    session.commit()

    if order_item_uc.are_all_order_items_of_order_ready(order_item_db.order):
        current_order = order_item_db.order
        
        current_order.sqlmodel_update({
            "status": OrderStatus.ready_for_delivery,
            "last_updated_at": datetime.now()
        })
        
        session.add(current_order)
        session.commit()
        
        delivery_payload = {
            "order_id": current_order.id
        }
        await redis_client.publish("order.ready", json.dumps(delivery_payload))
    
    session.refresh(order_item_db)
    return order_item_db

#  openapi_extra={
#         "requestBody": {
#             "content": {
#                 "application/json": {
#                     "example": {
#                         "status": "ready"
#                     }
#                 }
#             }
#         }
#     }