from httpx import AsyncClient

from .http_call_utils import http_call

RESTAURANT_SERVICE_URL = "http://localhost:8002"

async def get_menu_item_by_ids(ids: list[int]):

    async def call(client: AsyncClient):
        url = f"{RESTAURANT_SERVICE_URL}/menu-items"
        return await client.get(url=url, params={"ids": ids})
    
    return await http_call(call)
    

async def get_restaurant_by_id(id: int):

    async def call(client: AsyncClient):
        url = f"{RESTAURANT_SERVICE_URL}/restaurants/{id}"
        return await client.get(url=url)
    
    return await http_call(call)
    