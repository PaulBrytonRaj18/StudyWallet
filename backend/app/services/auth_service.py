from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.schemas.auth import RegisterRequest, PasswordChangeRequest
from app.config import settings


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, request: RegisterRequest) -> dict:
        existing_email = self.db.query(User).filter(User.email == request.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        existing_username = self.db.query(User).filter(User.username == request.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken",
            )

        user = User(
            email=request.email,
            username=request.username,
            hashed_password=hash_password(request.password),
            full_name=request.full_name,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        access_token = create_access_token(
            data={"sub": str(user.id), "type": "access"},
            expiration_minutes=settings.JWT_EXPIRATION_MINUTES,
        )

        return {
            "user": user,
            "token": {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.JWT_EXPIRATION_MINUTES * 60,
            },
        }

    def login(self, email: str, password: str) -> dict:
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        access_token = create_access_token(
            data={"sub": str(user.id), "type": "access"},
            expiration_minutes=settings.JWT_EXPIRATION_MINUTES,
        )

        return {
            "user": user,
            "token": {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.JWT_EXPIRATION_MINUTES * 60,
            },
        }

    def get_profile(self, user_id: str) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    def change_password(self, user_id: str, request: PasswordChangeRequest) -> None:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not verify_password(request.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        user.hashed_password = hash_password(request.new_password)
        self.db.commit()

    def refresh_token(self, user_id: str) -> dict:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        access_token = create_access_token(
            data={"sub": str(user.id), "type": "access"},
            expiration_minutes=settings.JWT_EXPIRATION_MINUTES,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_EXPIRATION_MINUTES * 60,
        }
