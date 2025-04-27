from fastapi import HTTPException, Depends, Path, Query
from fastapi.routing import APIRouter
from sqlmodel import Session, select

from ..utils import auth_utils
from ..models.users import User
from ..database import get_session

router = APIRouter()

@router.get("/", dependencies=[Depends(auth_utils.require_role(["admin"]))])
async def read_users(
    session: Session = Depends(get_session),
    offset: int = Query(default=0),
    limit: int = Query(default=100)
):
    users_db = session.exec(select(User).offset(offset).limit(limit)).all()
    return users_db

@router.get("/{id}", dependencies=[Depends(auth_utils.require_role(["admin"]))])
async def read_users(
    session: Session = Depends(get_session),
    id: int = Path()
):
    user_db = session.get(User, id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    return user_db

@router.patch("/{id}/active", dependencies=[Depends(auth_utils.require_role(["admin"]))])
async def active_user(
    session: Session = Depends(get_session),
    id: int = Path()
):
    user_db = session.get(User, id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    user_db.is_active = True
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

@router.patch("/{id}/block", dependencies=[Depends(auth_utils.require_role(["admin"]))])
async def block_user(
    session: Session = Depends(get_session),
    id: int = Path()
):
    user_db = session.get(User, id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    user_db.is_active = False
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

