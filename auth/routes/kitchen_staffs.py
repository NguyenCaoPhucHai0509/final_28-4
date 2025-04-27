from fastapi import Depends, Body, HTTPException, status
from fastapi.routing import APIRouter
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from ..models.kitchen_staffs import (
    KitchenStaff, KitchenStaffPublic,
    KitchenStaffCreate,
)
from ..models.users import (
    User
)
from ..database import get_session
from ..utils import auth_utils, restaurant_utils

router = APIRouter()

"""
Owner bases on user's role to assign the profile (in this case is kitchen staff)
Actors: restaurant owner
"""
@router.post("/", 
    response_model=KitchenStaffPublic, 
    dependencies=[Depends(auth_utils.require_role(["owner", "admin"]))]
)
async def create_kitchen_staff(
    session: Session = Depends(get_session),
    kitchen_staff: KitchenStaffCreate = Body()
):
    user_db = session.get(User, kitchen_staff.user_id)
    if not user_db:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if user_db.role != "kitchen_staff":
        raise HTTPException(
            status_code=400, 
            detail="User is not kitchen staff"
        )
    
    # Automatic raise exception
    branch_db = await restaurant_utils.get_branch_by_id(
                    kitchen_staff.branch_id)
     
    try:
        kitchen_staff_db = KitchenStaff.model_validate(kitchen_staff)
        session.add(kitchen_staff_db)
        session.commit()
        session.refresh(kitchen_staff_db)
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This kitchen staff already exists for the restaurant."
        )

    return kitchen_staff_db

@router.get("/me")
async def read_current_kitchen_staff(
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.require_role(["kitchen_staff"]))
):
    kitchen_staff = session.exec(
        select(KitchenStaff).where(KitchenStaff.user_id == current_user.id)
    ).first()
    if not kitchen_staff:
        raise HTTPException(status_code=404, detail="Kitchen staff not found")
    return kitchen_staff