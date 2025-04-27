from sqlmodel import SQLModel, Field
from pydantic import EmailStr, BaseModel
from typing import Annotated
from enum import Enum

class TokenData(BaseModel):
    username: Annotated[str | None, Field(default=None)]

class UserRole(str, Enum):
    customer = "customer"
    admin = "admin"
    owner = "owner"
    kitchen_staff = "kitchen_staff"
    driver = "driver"
    support_staff = "support_staff"

class UserBase(SQLModel):
    email: EmailStr
    username: str = Field(unique=True)
    role: UserRole = Field(default=UserRole.customer)

class UserCreate(UserBase):
    password: str = Field(min_length=3)

class UserUpdate(SQLModel):
    email: EmailStr | None = None
    is_active: bool | None = None

class User(UserBase, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    is_active: bool = False

class UserPublic(UserBase):
    id: int
    is_active: bool