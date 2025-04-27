from fastapi import HTTPException, status, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated
from httpx import AsyncClient

from .http_call_utils import http_call

AUTH_SERVICE_URL = "http://localhost:8001"

security = HTTPBearer()

async def get_current_active_user(
    # Help extract token in Authorization header ~ authorization: str = Header()
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    auth_header = f"Bearer {token}"
    async def call(client: AsyncClient):
        return await client.get(
                        url=f"{AUTH_SERVICE_URL}/auth/me", 
                        headers={"Authorization": auth_header}
                    )
    return await http_call(call)
   
def require_role(allowed_roles: list[str]):
    def checker(current_user: dict = Depends(get_current_active_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user
    return checker

async def get_current_kitchen_staff_info(
    credentials: HTTPAuthorizationCredentials = Depends(security)    
):
    token = credentials.credentials
    auth_header = f"Bearer {token}"

    async def call(client: AsyncClient):
        return await client.get(
                        url=f"{AUTH_SERVICE_URL}/kitchen-staffs/me", 
                        headers={"Authorization": auth_header}
                    )
    
    return await http_call(call)
    
