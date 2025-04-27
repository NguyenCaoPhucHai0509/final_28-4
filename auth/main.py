from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import create_db_and_tables
from .routes import auth, users, drivers, kitchen_staffs

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("START: AUTH")
    create_db_and_tables()
    yield
    print("STOP: AUTH")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["User"])
app.include_router(kitchen_staffs.router, prefix="/kitchen-staffs", tags=["Kitchen Staff"])
app.include_router(drivers.router, prefix="/drivers", tags=["Driver"])