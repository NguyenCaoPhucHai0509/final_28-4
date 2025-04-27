from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

CURRENT_DIR = os.path.dirname(__file__)

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    PASSWORD: str
    API_KEY: str

    model_config = SettingsConfigDict(env_file=f"{CURRENT_DIR}/.env")

@lru_cache
def get_settings():
    return Settings()