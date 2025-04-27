from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from datetime import datetime
from decimal import Decimal
from typing import Annotated, TYPE_CHECKING

if TYPE_CHECKING:
    from .order_items import OrderItem, OrderItemCreate, OrderItemPublicV1

class OrderStatus(str, Enum):
    pending = "pending"
    preparing = "preparing"
    ready_for_delivery = "ready_for_delivery"
    canceled = "canceled"

class OrderCreate(SQLModel):
    branch_id: int
    items: list["OrderItemCreate"] = Field(min_length=1)

    dropoff_lon: Decimal = Field(max_digits=9, decimal_places=6)
    dropoff_lat: Decimal = Field(max_digits=9, decimal_places=6)

class OrderUpdate(SQLModel):
    status: OrderStatus | None = None
    created_at: datetime | None = None

class Order(SQLModel, table=True):
    __tablename__ = "orders"
    id: int | None = Field(default=None, primary_key=True)
    branch_id: int
    customer_id: int
    status: OrderStatus = Field(default=OrderStatus.pending)
    created_at: datetime = Field(default_factory=datetime.now)

    order_items: list["OrderItem"] | None = Relationship(back_populates="order")

class OrderPublic(SQLModel):
    id: int
    branch_id: int
    customer_id: int
    status: OrderStatus
    created_at: datetime
    
    order_items: list["OrderItemPublicV1"]

from .order_items import OrderItemCreate, OrderItemPublicV1
OrderCreate.model_rebuild()
OrderPublic.model_rebuild()
