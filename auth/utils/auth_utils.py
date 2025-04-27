from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, Field, select
from typing import Annotated
import bcrypt

from ..models.users import User
from ..database import get_session
from ..config import get_settings

settings = get_settings()
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
bearer_scheme = HTTPBearer()

def get_password_hash(password):
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, 
                                    salt=salt)
    return hashed_password

def verify_password(plain_password, hashed_password):
    password_bytes_enc = plain_password.encode("utf-8")
    hashed_password_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password=password_bytes_enc, 
                    hashed_password=hashed_password_bytes)

async def get_user_by_username(
    session: Annotated[Session, Depends(get_session)], 
    username: Annotated[str, Field()]
) -> User:
    try:
        staff = session.exec(
            select(User)
            .where(User.username == username)
        ).one()
    except Exception:
        raise HTTPException(status_code=404, detail="User not found")

    return staff

async def authenticate(
    *,
    session: Annotated[Session, Depends(get_session)],
    username: Annotated[str, Field()],
    password: Annotated[str, Field()]
):
    user = await get_user_by_username(session, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token( 
    data: dict,
    expires_delta: timedelta | None = None
):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # if there is no expires_delta, just set expire time is 15 mins
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encode_jwt = jwt.encode(
                    to_encode, 
                    settings.SECRET_KEY, 
                    algorithm=settings.ALGORITHM
                )
    return encode_jwt


async def get_current_user(
    *,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: Session = Depends(get_session)
):
    
    token = credentials.credentials
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload: dict = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        # token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    
    user = await get_user_by_username(session=session, username=username)
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

def require_role(allowed_roles: list[str]):
    def checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user
    return checker

