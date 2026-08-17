import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    BASE_DIR: Path = BASE_DIR
    PROJECT_NAME: str = "Negar Web Application (نرم‌افزار جامع نگار)"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database Settings
    # PostgreSQL connection string e.g.: postgresql://postgres:password@localhost:5432/negar_db
    # If not set, defaults to a local SQLite database for zero-configuration startup.
    DB_TYPE: str = os.getenv("DB_TYPE", "sqlite")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "negar_db")
    
    @property
    def DATABASE_URL(self) -> str:
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            return env_url
        if self.DB_TYPE.lower() == "postgres" or self.DB_TYPE.lower() == "postgresql":
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        # Default fallback to SQLite
        sqlite_path = BASE_DIR / "negar_db.sqlite3"
        return f"sqlite:///{sqlite_path}"

    SECRET_KEY: str = os.getenv("SECRET_KEY", "negar-secret-key-2026-super-secure-key")
    STATIC_DIR: Path = BASE_DIR / "app" / "static"

settings = Settings()
