from fastapi import HTTPException

from decimal import Decimal
from httpx import AsyncClient

from ..utils import restaurant_utils, http_call_utils
from ..config import get_settings
from ..models.delivery_requests import DeliveryRequest


# Call external API, OpenRouteService (ORS), to get the distance
ORS_URL = "https://api.openrouteservice.org/v2"
RATE_PER_KM = 3000
BASE_FEE = 20000
settings = get_settings()

async def calculate_distance(branch_id: int, dropoff_lon: Decimal, dropoff_lat: Decimal):
    branch_db = await restaurant_utils.get_branch_by_id(branch_id)

    # print(f"BRANCH: {branch_db}")
    pickup_lon, pickup_lat = branch_db["longitude"], branch_db["latitude"]

    async def call(client: AsyncClient):
        return await client.get(
                f"{ORS_URL}/directions/driving-car",
                params={
                    "api_key": settings.ORS_API_KEY, 
                    "start": f"{pickup_lon},{pickup_lat}",
                    "end": f"{dropoff_lon},{dropoff_lat}",
                }
            )
    
    geo_data = await http_call_utils.http_call(call)
    distance_m = geo_data["features"][0]["properties"]["summary"]["distance"]
    distance_km = distance_m / 1000
    return distance_km

def calculate_shipping_fee(distance_km):
    return BASE_FEE + (distance_km * RATE_PER_KM)

def check_customer_and_driver(current_user: dict, delivery_request_db: DeliveryRequest):
    if current_user["role"] == "customer" and current_user["id"] == delivery_request_db.customer_id:
        delivery_request_db.is_customer_confirmed = True
    elif current_user["role"] == "driver" and current_user["id"] == delivery_request_db.driver_id:
        delivery_request_db.is_driver_confirmed = True
    else: raise HTTPException(status_code=400, detail="You don't relate to this delivery request")
