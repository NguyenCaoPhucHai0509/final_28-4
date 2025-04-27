from fastapi import Path, Depends, Body, Query, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.routing import APIRouter
from sqlmodel import Session
from typing import Annotated
from datetime import timedelta

from ..utils.auth_utils import (
    get_password_hash, authenticate, create_access_token,
    get_current_active_user, require_role
)
from ..models.users import User, UserCreate, UserPublic
from ..models.drivers import Driver
from ..config import Settings, get_settings
from ..database import get_session

router = APIRouter()

@router.post("/register", response_model=UserPublic)
async def create_user(
    *, 
    session: Session = Depends(get_session),
    user: UserCreate = Body()
):
    
    if user.role == "owner" or user.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="You are not allowed to create account with this role"
        )
        
    hashed_password = get_password_hash(user.password)
    extra_data = {"hashed_password": hashed_password}
    user_db = User.model_validate(user, update=extra_data)
    try:
        session.add(user_db)
    except:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="User already existed"
        )
    session.commit()
    session.refresh(user_db)

    # Automatic create `drivers` record
    if user.role == "driver":
        session.add(Driver(user_id=user_db.id))
        session.commit()

    return user_db

@router.post("/login")
async def login(
    *,
    session: Annotated[Session, Depends(get_session)],
    settings: Settings = Depends(get_settings),
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = await authenticate(
        session=session, 
        username=form_data.username, 
        password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.username)
        },
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }

"""
Client must send "Authorization: Bearer <Token>" header.
When testing API, we click "Authorize" button and fill the credentials.
Then the "/auth/me" endpoints will automatic extract the Authorization header
"""
@router.get("/me", response_model=UserPublic)
async def read_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return current_user