from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from .orders import Order

class OrderItemStatus(str, Enum):
    pending = "pending"
    preparing = "preparing"
    ready = "ready"

class OrderItemBase(SQLModel):
    menu_item_id: int
    quantity: int = Field(gt=0)
    note: str | None = None
    # note, promo_code ???
    
class OrderItemCreate(OrderItemBase):
    pass

class OrderItemUpdate(SQLModel):
    price: Decimal = Field(default=None, max_digits=10, decimal_places=2, ge=0)
    status: OrderItemStatus = None
    kitchen_staff_id: int | None = None
    last_updated_at: datetime | None = None
    
class OrderItem(OrderItemBase, table=True):
    __tablename__ = "order_items"
    id: int | None = Field(default=None, primary_key=True)
    order_id: int | None = Field(default=None, foreign_key="orders.id")
    price: Decimal = Field(max_digits=10, decimal_places=2, ge=0)
    status: OrderItemStatus = Field(default=OrderItemStatus.pending)
    kitchen_staff_id: int | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    last_updated_at: datetime | None = Field(default=None)

    order: Order | None = Relationship(back_populates="order_items")

"""Without order_id"""
class OrderItemPublicV1(OrderItemBase):
    id: int
    price: Decimal
    status: OrderItemStatus
    kitchen_staff_id: int | None
    created_at: datetime
    last_updated_at: datetime | None = None

"""With order_id"""
class OrderItemPublicV2(OrderItemPublicV1):
    order_id: int

