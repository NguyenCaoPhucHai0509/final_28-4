from sqlmodel import SQLModel, Field
from enum import Enum
from decimal import Decimal
from datetime import datetime


class PaymentStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"

class PaymentMethod(str, Enum):
    credit_card = "credit_card"
    cash = "cash"
    e_wallet = "e_wallet"

class Payment(SQLModel, table=True):
    __tablename__ = "payments"
    order_id: int = Field(primary_key=True)
    customer_id: int
    order_total_amount: Decimal = Field(default=0, max_digits=12, decimal_places=3)
    shipping_fee: Decimal = Field(default=0, max_digits=12, decimal_places=3)
    final_amount: Decimal = Field(default=0, max_digits=12, decimal_places=3)
    payment_method: PaymentMethod | None = None
    status: PaymentStatus = PaymentStatus.pending
    created_at: datetime = Field(default_factory=datetime.now)
    last_updated_at: datetime = None