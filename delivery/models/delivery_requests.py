from sqlmodel import SQLModel, Field
from decimal import Decimal
from enum import Enum

class DeliveryRequestStatus(str, Enum):
    pending = "pending"
    delivering = "delivering"
    delivered = "delivered"

class DeliveryRequestBase(SQLModel) :
    branch_id: int
    order_id: int
    customer_id: int
    dropoff_lon: Decimal = Field(max_digits=9, decimal_places=6)
    dropoff_lat: Decimal = Field(max_digits=9, decimal_places=6)

class DeliveryRequestCreate(DeliveryRequestBase):
    pass

class DeliveryRequestUpdate(SQLModel):
    is_active: bool | None = None
    driver_id: int | None = None
    status: DeliveryRequestStatus | None = None
    distance_km: Decimal = Field(max_digits=6, decimal_places=3)
    is_customer_confirmed: bool | None = False
    is_driver_confirmed: bool | None = False

class DeliveryRequest(DeliveryRequestBase, table=True):
    __tablename__ = "delivery_requests"
    order_id: int = Field(primary_key=True)
    is_active: bool = False
    driver_id: int | None = None
    status: DeliveryRequestStatus = Field(default=DeliveryRequestStatus.pending)
    distance_km: Decimal = Field(max_digits=6, decimal_places=3)
    shipping_fee: Decimal
    is_customer_confirmed: bool = False
    is_driver_confirmed: bool = False

class DeliveryRequestPublic(DeliveryRequestBase):
    driver_id: int
    distance_km: Decimal
    status: DeliveryRequestStatus = Field(default=DeliveryRequestStatus.pending)
    shipping_fee: Decimal
    is_customer_confirmed: bool
    is_driver_confirmed: bool

