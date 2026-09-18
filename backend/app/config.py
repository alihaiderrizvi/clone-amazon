"""Application configuration from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017/amazon_clone"

    # Supabase Auth
    supabase_url: str = ""
    supabase_jwt_secret: str = ""

    # Environment
    environment: str = "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def supabase_jwks_url(self) -> str:
        """URL to fetch Supabase JWKS for JWT verification."""
        return f"{self.supabase_url}/auth/v1/.well-known/jwks.json"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
