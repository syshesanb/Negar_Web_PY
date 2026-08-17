from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.domain.models import Base, UserAccount, Company, FiscalYear, Permission, RolePermission
from app.infrastructure.security import hash_password

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and seed default admin user and company if not present."""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(UserAccount).filter(UserAccount.Username == "admin").first()
        if not admin:
            hashed_pw = hash_password("admin123")
            admin_user = UserAccount(
                Username="admin",
                Password=hashed_pw,
                UserType="SuperAdmin",
                FullName="مدیر کل سیستم",
                IsActive=True,
                MaxCompaniesAllowed=99,
                MaxFiscalYearsPerCompany=99,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            # Create default company
            company = Company(
                CompanyName="شرکت نمونه نگار",
                CompanyCode="101",
                BrandName="نگار",
                EconomicCode="123456789012",
                IsActive=True,
                OwnerUserID=admin_user.UserID,
            )
            db.add(company)
            db.commit()
            db.refresh(company)

            # Create default fiscal year
            from datetime import datetime
            fiscal_year = FiscalYear(
                CompanyID=company.CompanyID,
                FiscalYearName="سال مالی ۱۴۰۵",
                StartDate=datetime(2026, 3, 21),
                EndDate=datetime(2027, 3, 20),
                IsActive=True,
            )
            db.add(fiscal_year)
            db.commit()
    finally:
        db.close()
