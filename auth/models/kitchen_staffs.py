from sqlmodel import SQLModel, Field


class KitchenStaffBase(SQLModel):
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    branch_id: int

class KitchenStaffCreate(KitchenStaffBase):
    pass

class KitchenStaff(KitchenStaffBase, table=True):
    __tablename__ = "kitchen_staffs"

class KitchenStaffPublic(KitchenStaffBase):
    pass