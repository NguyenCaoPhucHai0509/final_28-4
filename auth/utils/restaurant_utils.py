from httpx import AsyncClient
from .http_call_utils import http_call

RESTAURANT_SERVICE_URL = "http://localhost:8002"

async def get_branch_by_id(id: int):
    async def call(client: AsyncClient):
        return await client.get(f"{RESTAURANT_SERVICE_URL}/branches/{id}")
    return await http_call(call)