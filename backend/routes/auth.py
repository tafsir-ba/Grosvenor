"""Auth routes — login/logout/me/refresh. Single source: core.security."""
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr

from core.db import db
from core.security import (
    clear_auth_cookies,
    create_access_token,
    create_refresh_token,
    get_current_user,
    set_auth_cookies,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    access = create_access_token(user_id, email, user.get("role", "admin"))
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {
        "access_token": access,
        "user": {"id": user_id, "email": email, "name": user.get("name"), "role": user.get("role")},
    }


@router.post("/logout")
async def logout(response: Response, _: dict = Depends(get_current_user)):
    clear_auth_cookies(response)
    return {"ok": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name"), "role": user.get("role")}
