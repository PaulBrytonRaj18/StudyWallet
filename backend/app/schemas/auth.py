from uuid import UUID
from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = Field(None, max_length=255)

    @field_validator("full_name", mode="before")
    @classmethod
    def coerce_empty_full_name(cls, v: object) -> object:
        if v == "":
            return None
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
    token: TokenResponse


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
