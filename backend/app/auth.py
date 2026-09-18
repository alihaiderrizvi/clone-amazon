"""Supabase JWT verification using JWKS."""

import logging
from datetime import datetime, timedelta
from typing import Annotated

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.config import Settings, get_settings

logger = logging.getLogger(__name__)


class CurrentUser(BaseModel):
    """Authenticated user from JWT token."""

    user_id: str
    email: str | None = None


class JWKSCache:
    """Cache for Supabase JWKS keys."""

    def __init__(self, ttl_seconds: int = 3600):
        self._jwks: dict | None = None
        self._fetched_at: datetime | None = None
        self._ttl = timedelta(seconds=ttl_seconds)

    def is_expired(self) -> bool:
        """Check if cache is expired."""
        if self._fetched_at is None:
            return True
        return datetime.utcnow() - self._fetched_at > self._ttl

    async def get_jwks(self, jwks_url: str) -> dict:
        """Get JWKS, fetching from URL if cache is expired."""
        if self._jwks is None or self.is_expired():
            await self._fetch_jwks(jwks_url)
        return self._jwks or {}

    async def _fetch_jwks(self, jwks_url: str) -> None:
        """Fetch JWKS from Supabase."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(jwks_url, timeout=10.0)
                response.raise_for_status()
                self._jwks = response.json()
                self._fetched_at = datetime.utcnow()
                logger.info("JWKS fetched and cached")
        except Exception as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            if self._jwks is None:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Unable to verify authentication",
                )

    def clear(self) -> None:
        """Clear the cache."""
        self._jwks = None
        self._fetched_at = None


# Global JWKS cache
_jwks_cache = JWKSCache()

# HTTP Bearer security scheme
security = HTTPBearer()


def _get_signing_key(jwks: dict, token: str) -> jwt.PyJWK:
    """Get the signing key from JWKS for the given token."""
    try:
        unverified_header = jwt.get_unverified_header(token)
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token header: {e}",
        )

    kid = unverified_header.get("kid")
    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing key ID",
        )

    # Find the key with matching kid
    keys = jwks.get("keys", [])
    for key_data in keys:
        if key_data.get("kid") == kid:
            return jwt.PyJWK(key_data)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find appropriate signing key",
    )


async def verify_jwt(
    token: str,
    settings: Settings,
) -> CurrentUser:
    """Verify a Supabase JWT token and return the current user."""
    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication not configured",
        )

    # Fetch JWKS
    jwks = await _jwks_cache.get_jwks(settings.supabase_jwks_url)

    # Get signing key
    signing_key = _get_signing_key(jwks, token)

    try:
        # Verify and decode the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_exp": True,
                "verify_iat": True,
                "require": ["exp", "sub"],
            },
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user ID",
            )

        email = payload.get("email")

        return CurrentUser(user_id=user_id, email=email)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
        )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> CurrentUser:
    """FastAPI dependency to get the current authenticated user."""
    return await verify_jwt(credentials.credentials, settings)


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(HTTPBearer(auto_error=False))],
    settings: Annotated[Settings, Depends(get_settings)],
) -> CurrentUser | None:
    """FastAPI dependency to optionally get the current user (no auth required)."""
    if credentials is None:
        return None
    try:
        return await verify_jwt(credentials.credentials, settings)
    except HTTPException:
        return None
