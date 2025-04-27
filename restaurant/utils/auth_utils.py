from fastapi import HTTPException, status, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from fastapi.security import OAuth2PasswordBearer
import httpx
from typing import Annotated
from .http_call_utils import http_call

AUTH_SERVICE_URL = "http://localhost:8001"
security = HTTPBearer()

def get_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    return credentials.credentials

async def get_current_active_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    auth_header = f"Bearer {token}"
    # print(f"AUTHORIZATION: {auth_header}")

    async with httpx.AsyncClient() as client:
        try:
            response: httpx.Response = await client.get(
                    url=f"{AUTH_SERVICE_URL}/auth/me", 
                    headers={"Authorization": auth_header}
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            # For resquest
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while requesting {exc.request.url!r}."
            )
        except httpx.HTTPStatusError as exc:
            # For response
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=response.json().get("detail", "Unknow error")
            )

def require_role(allowed_roles: list[str]):
    def checker(current_user: dict = Depends(get_current_active_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user
    return checker

async def update_restuarant_id_of_manager(manager_id: int, restaurant_id: int):
    async def call(client: httpx.AsyncClient):
        return await client.patch(
            f"{AUTH_SERVICE_URL}/managers/{manager_id}/update-restaurant-id",
            headers={"Content-Type": "application/json-patch+json"},
            json={"restaurant_id": restaurant_id}
        )
    return await http_call(call)

