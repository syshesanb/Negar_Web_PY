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

        # Ensure new columns exist in Currencies table
        try:
            from sqlalchemy import text
            with engine.connect() as conn:
                for col, col_type in [
                    ("CbiRate", "NUMERIC(18, 4) DEFAULT 1.0"),
                    ("CbiRateDate", "VARCHAR(20)"),
                    ("TgjuRate", "NUMERIC(18, 4) DEFAULT 1.0"),
                    ("TgjuRateDate", "VARCHAR(20)"),
                    ("GlobalRate", "NUMERIC(18, 4) DEFAULT 1.0"),
                    ("GlobalRateDate", "VARCHAR(20)")
                ]:
                    try:
                        conn.execute(text(f"ALTER TABLE Currencies ADD COLUMN {col} {col_type};"))
                        conn.commit()
                    except Exception:
                        pass
        except Exception:
            pass

        # Seed Currencies if none exist
        from app.domain.models import Currency
        curr_count = db.query(Currency).count()
        if curr_count == 0:
            today_str = "1405/05/27"
            default_currencies = [
                Currency(CurrencyCode="IRR", CurrencyName="ریال ایران", CurrencySymbol="﷼", IsBase=True, ManualRate=1.0, ManualRateDate=today_str, CbiRate=1.0, TgjuRate=1.0, GlobalRate=1.0, OnlineRate=1.0, OnlineRateDate=today_str),
                Currency(CurrencyCode="TMN", CurrencyName="تومان", CurrencySymbol="تومان", IsBase=False, ManualRate=10.0, ManualRateDate=today_str, CbiRate=10.0, TgjuRate=10.0, GlobalRate=10.0, OnlineRate=10.0, OnlineRateDate=today_str),
                Currency(CurrencyCode="USD", CurrencyName="دلار آمریکا", CurrencySymbol="$", IsBase=False, ManualRate=615000.0, ManualRateDate=today_str, CbiRate=448500.0, TgjuRate=618500.0, GlobalRate=619200.0, OnlineRate=618500.0, OnlineRateDate=today_str),
                Currency(CurrencyCode="EUR", CurrencyName="یورو", CurrencySymbol="€", IsBase=False, ManualRate=665000.0, ManualRateDate=today_str, CbiRate=486200.0, TgjuRate=668000.0, GlobalRate=669500.0, OnlineRate=668000.0, OnlineRateDate=today_str),
                Currency(CurrencyCode="AED", CurrencyName="درهم امارات", CurrencySymbol="د.إ", IsBase=False, ManualRate=168000.0, ManualRateDate=today_str, CbiRate=122100.0, TgjuRate=168500.0, GlobalRate=168600.0, OnlineRate=168500.0, OnlineRateDate=today_str),
                Currency(CurrencyCode="TRY", CurrencyName="لیر ترکیه", CurrencySymbol="₺", IsBase=False, ManualRate=18800.0, ManualRateDate=today_str, CbiRate=13750.0, TgjuRate=18950.0, GlobalRate=18920.0, OnlineRate=18950.0, OnlineRateDate=today_str),
                Currency(CurrencyCode="CNY", CurrencyName="یوان چین", CurrencySymbol="¥", IsBase=False, ManualRate=86000.0, ManualRateDate=today_str, CbiRate=62100.0, TgjuRate=86700.0, GlobalRate=86800.0, OnlineRate=86700.0, OnlineRateDate=today_str),
                Currency(CurrencyCode="GBP", CurrencyName="پوند انگلیس", CurrencySymbol="£", IsBase=False, ManualRate=775000.0, ManualRateDate=today_str, CbiRate=569000.0, TgjuRate=776000.0, GlobalRate=778000.0, OnlineRate=776000.0, OnlineRateDate=today_str),
            ]
            db.add_all(default_currencies)
            db.commit()
    finally:
        db.close()

