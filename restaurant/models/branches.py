from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING
from decimal import Decimal

if TYPE_CHECKING:
    from .menu_items import MenuItem

class BranchBase(SQLModel):
    name: str
    latitude: Decimal = Field(max_digits=9, decimal_places=6)
    longitude: Decimal = Field(max_digits=9, decimal_places=6)

    # could have create_at, updated_at

class BranchCreate(BranchBase):
    pass

class Branch(BranchBase, table=True):
    __tablename__ = "branches"
    id: int = Field(default=None, primary_key=True)

class BranchPublic(BranchBase):
    id: int