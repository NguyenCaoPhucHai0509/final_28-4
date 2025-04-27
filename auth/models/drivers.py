from sqlmodel import SQLModel, Field
from decimal import Decimal

class DriverBase(SQLModel):
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    vehical_info: str | None = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(SQLModel):
    vehical_info: str | None = None

class Driver(DriverBase, table=True):
    __tablename__ = "drivers"
    
class DriverPublic(DriverBase):
    pass