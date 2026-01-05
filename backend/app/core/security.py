import hashlib
import hmac

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from app.core.config import settings

_admin_key_header = APIKeyHeader(name="X-ADMIN-KEY", auto_error=False)

def admin_required(x_admin_key: str | None = Depends(_admin_key_header)):
    if not x_admin_key or x_admin_key != settings.admin_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

def hash_password(password: str) -> str:
    salt = settings.auth_salt.encode("utf-8")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return digest.hex()

def verify_password(password: str, password_hash: str) -> bool:
    expected = hash_password(password)
    return hmac.compare_digest(expected, password_hash)
