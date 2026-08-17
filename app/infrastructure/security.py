import hashlib
import uuid
from typing import Optional


def hash_password(password: str) -> str:
    """Hash password using SHA-256 (matches C# Negar.Infrastructure.Security.PasswordHasher)."""
    if not password:
        return ""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(input_password: str, stored_hash: str) -> bool:
    """Verify input password against stored hash."""
    if not input_password or not stored_hash:
        return False
    return hash_password(input_password).lower() == stored_hash.lower()


def create_access_token(user_id: int, username: str) -> str:
    """Generate a token for authenticated user session."""
    return f"JWT_NEGAR_PY_USER_{user_id}_{uuid.uuid4()}"
