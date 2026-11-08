import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def get_cors_origins() -> tuple[str, ...]:
    return tuple(
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:5174,"
            "http://127.0.0.1:5173,http://127.0.0.1:5174",
        ).split(",")
        if origin.strip()
    )


@dataclass(frozen=True)
class Settings:
    supabase_url: str
    supabase_publishable_key: str
    supabase_jwks_url: str
    gemini_api_key: str
    gemini_model: str
    cors_origins: tuple[str, ...]

    @classmethod
    def from_env(cls) -> "Settings":
        required = {
            "SUPABASE_URL": os.getenv("SUPABASE_URL"),
            "SUPABASE_PUBLISHABLE_KEY": os.getenv("SUPABASE_PUBLISHABLE_KEY"),
            "SUPABASE_JWKS_URL": os.getenv("SUPABASE_JWKS_URL"),
            "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY"),
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            raise RuntimeError(f"Missing required assistant service settings: {', '.join(missing)}")

        return cls(
            supabase_url=required["SUPABASE_URL"].rstrip("/"),
            supabase_publishable_key=required["SUPABASE_PUBLISHABLE_KEY"],
            supabase_jwks_url=required["SUPABASE_JWKS_URL"],
            gemini_api_key=required["GEMINI_API_KEY"],
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
            cors_origins=get_cors_origins(),
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_env()
