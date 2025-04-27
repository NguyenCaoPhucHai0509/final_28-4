from fastapi import HTTPException
import redis.asyncio as redis
import json
from sqlmodel import Session, select
from pydantic import ValidationError
from sqlalchemy.exc import OperationalError

from .models.orders import Order, OrderStatus
from .database import engine

redis_client = redis.Redis()

async def subscribe_to_preparing_orders():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("order.preparing")

    print("ORDER PREPARING CHANNEL IS LISTENING")

    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            print(f"SUBSCRIBED DATA: {data}")
            try:
                with Session(engine) as session:
                    order_db = session.get(Order, data["order_id"])
                    print(f"ORDER DB: {order_db}")
                    order_db.status = OrderStatus.preparing
                    session.add(order_db)
                    session.commit()
            except OperationalError:
                raise HTTPException(status_code=500, detail="Add DB failed")
            except ValidationError as e:
                raise HTTPException(status_code=400, detail=e.errors())

