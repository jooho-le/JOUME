from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from .database import get_db
from .models import Session, User

bearer = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: Optional[str] = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 210_000).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    salt, _ = stored.split("$", 1)
    return secrets.compare_digest(hash_password(password, salt), stored)


def issue_session(db: DBSession, user_id: int) -> str:
    token = secrets.token_urlsafe(40)
    db.add(Session(token=token, user_id=user_id, expires_at=datetime.utcnow() + timedelta(days=30)))
    db.commit()
    return token


def current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: DBSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(401, "로그인이 필요합니다.")
    session = db.scalar(select(Session).where(Session.token == credentials.credentials))
    if not session or session.expires_at < datetime.utcnow():
        raise HTTPException(401, "세션이 만료되었습니다.")
    user = db.get(User, session.user_id)
    if not user:
        raise HTTPException(401, "사용자를 찾을 수 없습니다.")
    return user
