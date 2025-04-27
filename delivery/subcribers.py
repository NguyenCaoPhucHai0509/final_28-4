from fastapi import HTTPException
import redis.asyncio as redis
import json
from sqlmodel import Session, select
from pydantic import ValidationError
from sqlalchemy.exc import OperationalError
from .models.delivery_requests import DeliveryRequest
from .database import engine
from .use_cases.delivery_request_uc import calculate_distance, calculate_shipping_fee

redis_client = redis.Redis()
publisher = redis.Redis()

async def subscribe_to_created_orders():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("order.created")
    print("ORDER CREATED CHANNEL IS LISTENING")

    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            print(f"SUBSCRIBED DATA: {data}")
            
            distance_km = await calculate_distance(
                                        data["branch_id"], 
                                        dropoff_lon=data["dropoff_lon"], 
                                        dropoff_lat=data["dropoff_lat"]
                                    )
                    
            print(f"DISTANCE KM: {distance_km}")
                    
            shipping_fee = calculate_shipping_fee(distance_km)

            print(f"SHIPPING FEE: {shipping_fee}")

            try:
                with Session(engine) as session:
                    # Create DeliveryRequest, add it to DB
                    delivery_request_db = DeliveryRequest(
                        branch_id=data["branch_id"],
                        order_id=data["order_id"],
                        customer_id=data["customer_id"],
                        dropoff_lat=data["dropoff_lat"],
                        dropoff_lon=data["dropoff_lon"],
                        distance_km=distance_km,
                        shipping_fee=shipping_fee
                    )
                    session.add(delivery_request_db)
                    session.commit()

            except OperationalError:
                raise HTTPException(status_code=500, detail="Add DB failed")
            except ValidationError as e:
                raise HTTPException(status_code=400, detail=e.errors())
            
            # Publish for creating payment
            channel = "delivery.created"

            data = {
                "order_id": data["order_id"],
                "customer_id": data["customer_id"],
                "order_total_amount": data["order_total_amount"],
                "shipping_fee": shipping_fee
            }
            print(f"DATA: {data}")
            await publisher.publish(channel, json.dumps(data))
            
async def subscribe_to_ready_orders():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("order.ready")

    print("ORDER READY CHANNEL IS LISTENING")

    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            print(f"SUBSCRIBED DATA: {data}")

            try:
                with Session(engine) as session:
                    delivery_request_db = session.exec(
                        select(DeliveryRequest)
                        .where(DeliveryRequest.order_id == data["order_id"])
                    ).one()

                    delivery_request_db.is_active = True
                    session.add(delivery_request_db)
                    session.commit()
            except OperationalError:
                raise HTTPException(status_code=500, detail="Add DB failed")
            except ValidationError as e:
                raise HTTPException(status_code=400, detail=e.errors())
            