from sqlalchemy.orm import Session
from app.domain.models import UserAccount
from app.infrastructure.security import verify_password, create_access_token
from app.schemas.schemas import LoginRequest, LoginResponse


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def login(self, request: LoginRequest) -> LoginResponse:
        user = (
            self.db.query(UserAccount)
            .filter(UserAccount.Username.ilike(request.username.strip()))
            .first()
        )

        if not user or not user.IsActive:
            return LoginResponse(
                success=False,
                message="نام کاربری یا رمز عبور اشتباه است یا کاربر غیرفعال می‌باشد.",
            )

        if not verify_password(request.password, user.Password):
            return LoginResponse(
                success=False,
                message="نام کاربری یا رمز عبور اشتباه است.",
            )

        token = create_access_token(user.UserID, user.Username)

        return LoginResponse(
            success=True,
            message="خوش آمدید",
            userID=user.UserID,
            username=user.Username,
            fullName=user.FullName or user.Username,
            userType=user.UserType,
            token=token,
        )
