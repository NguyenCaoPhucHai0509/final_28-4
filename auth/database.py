from sqlmodel import SQLModel, Session, create_engine
from .config import get_settings

settings = get_settings()
PASSWORD = settings.PASSWORD

# Nên sử dụng tài khoản root như đã cấu hình
DATABASE_URL = f"mysql+pymysql://root:{PASSWORD}@localhost:3306/auth"
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session