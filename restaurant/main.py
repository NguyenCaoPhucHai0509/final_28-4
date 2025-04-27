from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import create_db_and_tables
from .routes import branches, menu_items



@asynccontextmanager
async def lifespan(app: FastAPI):
    print("START: RESTAURANT")
    create_db_and_tables()
    yield
    print("STOP: RESTAURANT")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(branches.router, tags=["Restaurant"])
app.include_router(menu_items.router, tags=["Menu Item"])