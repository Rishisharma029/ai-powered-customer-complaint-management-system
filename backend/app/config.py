import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pharma QMS Customer Complaint AI System"
    API_V1_STR: str = "/api"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "gemma2-9b-it" # gemma2-9b-it or llama-3.3-70b-versatile
    DATABASE_URL: str = "sqlite:///./complaints.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
