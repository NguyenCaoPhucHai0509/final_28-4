from fastapi import HTTPException
import redis.asyncio as redis
import json
from sqlmodel import Session
from pydantic import ValidationError
from sqlalchemy.exc import OperationalError

from .models.payments import Payment
from .database import engine


redis_client = redis.Redis()

async def subscribe_to_created_delivery():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("delivery.created")
    print("PAYMENT CREATING CHANNEL IS LISTENING")

    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            print(f"SUBSCRIBED DATA: {data}")
            try:
                with Session(engine) as session:
                    payment_db = Payment(
                        order_id=data["order_id"],
                        customer_id=data["customer_id"],
                        order_total_amount=data["order_total_amount"],
                        shipping_fee=data["shipping_fee"],
                        final_amount=float(data["order_total_amount"]) + data["shipping_fee"]
                    )
                    session.add(payment_db)
                    session.commit()

            except OperationalError:
                raise HTTPException(status_code=500, detail="Add DB failed")
            except ValidationError as e:
                raise HTTPException(status_code=400, detail=e.errors())