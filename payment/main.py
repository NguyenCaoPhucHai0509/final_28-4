from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from .database import create_db_and_tables
from .routes import payments
from .subcribers import subscribe_to_created_delivery
background_tasks = []
redis_connections = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("START: PAYMENT")
    create_db_and_tables()
    # Start Redis subscriber (background task)
    loop = asyncio.get_event_loop()

    # Start subscribers in background
    background_tasks.extend([
        loop.create_task(subscribe_to_created_delivery())
    ])

    yield

    for task in background_tasks:
        task.cancel()

    for conn in redis_connections:
        await conn.close()
    print("STOP: PAYMENT")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(payments.router, prefix="/payments", tags=["Payment"])