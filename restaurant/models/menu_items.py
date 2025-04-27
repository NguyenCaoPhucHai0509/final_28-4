from sqlmodel import SQLModel, Field
from typing import Annotated
from decimal import Decimal


class MenuItemBase(SQLModel):
    name: str
    price: Decimal = Field(max_digits=10, decimal_places=2, ge=0)
    description: str | None = None
    is_available: bool | None = True
    # could have create_at, updated_at

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(SQLModel):
    branch_id: int = None
    name: str = None
    price: Decimal = Field(ge=0)
    description: str | None = None
    is_available: bool = None

class MenuItem(MenuItemBase, table=True):
    __tablename__ = "menu_items"
    id: int = Field(default=None, primary_key=True)
    branch_id: int = Field(foreign_key="branches.id")

class MenuItemPublic(MenuItemBase):
    id: int
    branch_id: int

