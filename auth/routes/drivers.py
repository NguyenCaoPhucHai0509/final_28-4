from fastapi import Path, Depends, Body, HTTPException, status
from fastapi.routing import APIRouter
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from ..models.drivers import Driver, DriverCreate, DriverUpdate, DriverPublic
from ..models.users import User
from ..utils import auth_utils, restaurant_utils
from ..database import get_session

router = APIRouter()

@router.get("/me", response_model=DriverPublic)
async def read_current_driver(
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.require_role(["driver"]))
):
    return session.get(Driver, current_user.id)

@router.patch("/me/update-info", 
    response_model=DriverPublic
)
async def update_mine_info(
    session: Session = Depends(get_session),
    current_user: User = Depends(auth_utils.require_role(["driver"])),
    driver: DriverUpdate = Body()
):
    current_driver_db = session.get(Driver, current_user.id)
    current_driver_db.sqlmodel_update(
        driver.model_dump(exclude_unset=True)
    )
    session.add(current_driver_db)
    session.commit()
    session.refresh(current_driver_db)
    return current_driver_db


# @router.patch("/me/availability")
# async def update_available(): pass

# @router.patch("/me/location")
# async def update_location(): pass