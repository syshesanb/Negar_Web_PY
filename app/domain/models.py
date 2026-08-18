from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Numeric,
    Text,
    LargeBinary,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class UserAccount(Base):
    __tablename__ = "Users"

    UserID = Column(Integer, primary_key=True, autoincrement=True)
    Username = Column(String(100), nullable=False, unique=True)
    Password = Column(String(255), nullable=False)
    UserType = Column(String(50), nullable=False, default="User")  # SuperAdmin, Manager, User
    CreatedBy = Column(Integer, nullable=True)
    CreatedDate = Column(DateTime, default=datetime.utcnow)
    IsActive = Column(Boolean, default=True)
    FullName = Column(String(150), nullable=True)
    CreatorIP = Column(String(50), nullable=True)
    MaxCompaniesAllowed = Column(Integer, default=0)
    MaxFiscalYearsPerCompany = Column(Integer, default=0)

    RolePermissions = relationship("RolePermission", back_populates="User", cascade="all, delete-orphan")


class Permission(Base):
    __tablename__ = "Permissions"

    PermissionID = Column(Integer, primary_key=True, autoincrement=True)
    PermissionName = Column(String(150), nullable=False)
    PermissionKey = Column(String(100), nullable=False, unique=True)
    SectionName = Column(String(100), nullable=True)


class RolePermission(Base):
    __tablename__ = "RolePermissions"

    RolePermID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("Users.UserID", ondelete="CASCADE"), nullable=False)
    PermissionID = Column(Integer, ForeignKey("Permissions.PermissionID", ondelete="CASCADE"), nullable=False)
    CanView = Column(Boolean, default=True)
    CanCreate = Column(Boolean, default=False)
    CanEdit = Column(Boolean, default=False)
    CanDelete = Column(Boolean, default=False)
    CanPrint = Column(Boolean, default=False)
    CanExport = Column(Boolean, default=False)

    __table_args__ = (UniqueConstraint("UserID", "PermissionID", name="UQ_RolePermissions_User_Perm"),)

    User = relationship("UserAccount", back_populates="RolePermissions")
    Permission = relationship("Permission")


class Company(Base):
    __tablename__ = "Companies"

    CompanyID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyName = Column(String(200), nullable=False)
    CompanyCode = Column(String(50), nullable=True)
    BrandName = Column(String(200), nullable=True)
    EconomicCode = Column(String(50), nullable=True)
    FiscalYearStartDate = Column(DateTime, nullable=True)
    FiscalYearEndDate = Column(DateTime, nullable=True)
    PostalCode = Column(String(20), nullable=True)
    RegistrationDate = Column(DateTime, nullable=True)
    RegistrationNumber = Column(String(50), nullable=True)
    ActivityField = Column(String(250), nullable=True)
    Address = Column(Text, nullable=True)
    Phone = Column(String(50), nullable=True)
    Phone2 = Column(String(50), nullable=True)
    Email = Column(String(100), nullable=True)
    TaxID = Column(String(50), nullable=True)
    LogoImage = Column(LargeBinary, nullable=True)
    ChairmanName = Column(String(150), nullable=True)
    InspectorName = Column(String(150), nullable=True)
    CEOName = Column(String(150), nullable=True)
    OwnerUserID = Column(Integer, ForeignKey("Users.UserID", ondelete="SET NULL"), nullable=True)
    AccountLevels = Column(Integer, default=4)
    Level1Length = Column(Integer, default=2)
    Level2Length = Column(Integer, default=2)
    Level3Length = Column(Integer, default=2)
    Level4Length = Column(Integer, default=2)
    Level5Length = Column(Integer, default=2)
    ProductGroupLevels = Column(Integer, default=3)
    IsActive = Column(Boolean, default=True)

    FiscalYears = relationship("FiscalYear", back_populates="Company", cascade="all, delete-orphan")


class FiscalYear(Base):
    __tablename__ = "FiscalYears"

    FiscalYearID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, ForeignKey("Companies.CompanyID", ondelete="CASCADE"), nullable=False)
    FiscalYearName = Column(String(100), nullable=False)
    StartDate = Column(DateTime, nullable=False)
    EndDate = Column(DateTime, nullable=False)
    IsActive = Column(Boolean, default=True)

    Company = relationship("Company", back_populates="FiscalYears")


class ProductGroup(Base):
    __tablename__ = "ProductGroups"

    GroupID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, ForeignKey("Companies.CompanyID", ondelete="CASCADE"), nullable=False)
    ParentID = Column(Integer, ForeignKey("ProductGroups.GroupID", ondelete="CASCADE"), nullable=True)
    GroupCode = Column(String(50), nullable=False)
    GroupName = Column(String(150), nullable=False)
    Level = Column(Integer, nullable=False, default=1)
    IsActive = Column(Boolean, default=True)

    ParentGroup = relationship("ProductGroup", remote_side=[GroupID], backref="ChildGroups")


class Product(Base):
    __tablename__ = "Products"

    ProductID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, nullable=True)
    ProductCode = Column(String(50), nullable=False)
    ProductName = Column(String(200), nullable=False)
    Unit = Column(String(50), default="عدد")
    DefaultPrice = Column(Numeric(18, 2), default=0.0)
    Category = Column(String(100), nullable=True)
    IsActive = Column(Boolean, default=True)
    ProductGroupID = Column(Integer, ForeignKey("ProductGroups.GroupID", ondelete="SET NULL"), nullable=True)
    Barcode = Column(String(100), nullable=True)
    ProductType = Column(String(50), default="کالا")
    PurchasePrice = Column(Numeric(18, 2), default=0.0)
    MinStock = Column(Numeric(18, 2), default=0.0)
    ReorderPoint = Column(Numeric(18, 2), default=0.0)
    MaxStock = Column(Numeric(18, 2), default=0.0)
    TrackingType = Column(String(50), default="عادی")
    TechnicalName = Column(String(200), nullable=True)
    TaxPercent = Column(Numeric(5, 2), default=0.0)
    TollPercent = Column(Numeric(5, 2), default=0.0)

    ProductGroup = relationship("ProductGroup")


class Warehouse(Base):
    __tablename__ = "Warehouses"

    WarehouseID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, nullable=True)
    WarehouseName = Column(String(150), nullable=False)
    Location = Column(String(250), nullable=True)
    IsActive = Column(Boolean, default=True)
    WarehouseType = Column(String(50), default="عمومی")
    Phone = Column(String(50), nullable=True)
    WarehouseKeeper = Column(String(150), nullable=True)
    AllowNegativeStock = Column(Boolean, default=False)
    Description = Column(Text, nullable=True)


class InventoryRecord(Base):
    __tablename__ = "Inventory"

    InventoryID = Column(Integer, primary_key=True, autoincrement=True)
    ProductID = Column(Integer, ForeignKey("Products.ProductID", ondelete="CASCADE"), nullable=False)
    WarehouseID = Column(Integer, ForeignKey("Warehouses.WarehouseID", ondelete="CASCADE"), nullable=False)
    Quantity = Column(Numeric(18, 4), default=0.0)
    AverageCost = Column(Numeric(18, 2), default=0.0)
    LastUpdate = Column(DateTime, default=datetime.utcnow)

    Product = relationship("Product")
    Warehouse = relationship("Warehouse")


class PurchaseInvoice(Base):
    __tablename__ = "PurchaseInvoices"

    InvoiceID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, nullable=True)
    InvoiceNumber = Column(String(50), nullable=False)
    InvoiceDate = Column(DateTime, default=datetime.utcnow)
    VendorName = Column(String(200), nullable=True)
    TotalAmount = Column(Numeric(18, 2), default=0.0)
    CreatedBy = Column(Integer, nullable=True)
    WarehouseID = Column(Integer, nullable=True)

    Details = relationship("PurchaseInvoiceDetail", back_populates="Invoice", cascade="all, delete-orphan")


class PurchaseInvoiceDetail(Base):
    __tablename__ = "PurchaseInvoiceDetails"

    DetailID = Column(Integer, primary_key=True, autoincrement=True)
    InvoiceID = Column(Integer, ForeignKey("PurchaseInvoices.InvoiceID", ondelete="CASCADE"), nullable=False)
    ProductID = Column(Integer, ForeignKey("Products.ProductID"), nullable=False)
    Quantity = Column(Numeric(18, 4), default=0.0)
    UnitPrice = Column(Numeric(18, 2), default=0.0)
    TotalPrice = Column(Numeric(18, 2), default=0.0)

    Invoice = relationship("PurchaseInvoice", back_populates="Details")
    Product = relationship("Product")


class SalesInvoice(Base):
    __tablename__ = "SalesInvoices"

    InvoiceID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, nullable=True)
    InvoiceNumber = Column(String(50), nullable=False)
    InvoiceDate = Column(DateTime, default=datetime.utcnow)
    CustomerName = Column(String(200), nullable=True)
    TotalAmount = Column(Numeric(18, 2), default=0.0)
    CreatedBy = Column(Integer, nullable=True)
    WarehouseID = Column(Integer, nullable=True)

    Details = relationship("SalesInvoiceDetail", back_populates="Invoice", cascade="all, delete-orphan")


class SalesInvoiceDetail(Base):
    __tablename__ = "SalesInvoiceDetails"

    DetailID = Column(Integer, primary_key=True, autoincrement=True)
    InvoiceID = Column(Integer, ForeignKey("SalesInvoices.InvoiceID", ondelete="CASCADE"), nullable=False)
    ProductID = Column(Integer, ForeignKey("Products.ProductID"), nullable=False)
    Quantity = Column(Numeric(18, 4), default=0.0)
    UnitPrice = Column(Numeric(18, 2), default=0.0)
    TotalPrice = Column(Numeric(18, 2), default=0.0)
    CostAtSaleTime = Column(Numeric(18, 2), default=0.0)

    Invoice = relationship("SalesInvoice", back_populates="Details")
    Product = relationship("Product")


class SarfaslHesab(Base):
    __tablename__ = "SarfaslHesab"

    AccountID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, nullable=False)
    AccountCode = Column(String(50), nullable=False)
    AccountName = Column(String(200), nullable=False)
    AccountType = Column(String(50), default="معین")  # گروه, کل, معین, تفصیلی
    ParentAccountID = Column(Integer, ForeignKey("SarfaslHesab.AccountID", ondelete="RESTRICT"), nullable=True)
    IsActive = Column(Boolean, default=True)
    AccountNature = Column(String(50), default="بدهکار/بستانکار")  # بدهکار, بستانکار, خنثی

    __table_args__ = (UniqueConstraint("CompanyID", "AccountCode", name="UQ_SarfaslHesab_Company_Code"),)

    ParentAccount = relationship("SarfaslHesab", remote_side=[AccountID], backref="ChildAccounts")


class SarfaslShenavar(Base):
    __tablename__ = "SarfaslShenavar"

    ShenavarID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, nullable=False)
    AccountCode = Column(String(50), nullable=False)
    AccountName = Column(String(200), nullable=False)
    ParentShenavarID = Column(Integer, nullable=True)
    IsActive = Column(Boolean, default=True)


class SanadHeader(Base):
    __tablename__ = "Sanad1"

    EntryID = Column(Integer, primary_key=True, autoincrement=True)
    CompanyID = Column(Integer, nullable=False)
    FiscalYearID = Column(Integer, nullable=False)
    EntryDate = Column(DateTime, default=datetime.utcnow)
    Description = Column(Text, nullable=True)
    ReferenceNumber = Column(String(50), nullable=True)
    CreatedBy = Column(Integer, nullable=True)
    JamBedehkar = Column(Numeric(18, 2), default=0.0)
    JamBestankar = Column(Numeric(18, 2), default=0.0)
    TaeazSanad = Column(String(50), default="متوازن")
    SharhSanad = Column(Text, nullable=True)
    VazeiatSanad = Column(String(50), default="یادداشت")  # یادداشت, موقت, دائم
    AdamVirayesh = Column(Boolean, default=False)

    Details = relationship("SanadDetail", back_populates="Header", cascade="all, delete-orphan")


class SanadDetail(Base):
    __tablename__ = "Sanad2"

    DetailID = Column(Integer, primary_key=True, autoincrement=True)
    EntryID = Column(Integer, ForeignKey("Sanad1.EntryID", ondelete="CASCADE"), nullable=False)
    AccountID = Column(Integer, ForeignKey("SarfaslHesab.AccountID", ondelete="RESTRICT"), nullable=False)
    DebitAmount = Column(Numeric(18, 2), default=0.0)
    CreditAmount = Column(Numeric(18, 2), default=0.0)
    LineNumber = Column(Integer, default=1)
    ShenavarID = Column(Integer, ForeignKey("SarfaslShenavar.ShenavarID", ondelete="SET NULL"), nullable=True)
    SharhRadif = Column(Text, nullable=True)
    TransactionNumber = Column(String(50), nullable=True)
    TransactionDate = Column(String(50), nullable=True)

    Header = relationship("SanadHeader", back_populates="Details")
    Account = relationship("SarfaslHesab")
    Shenavar = relationship("SarfaslShenavar")


class AppSetting(Base):
    __tablename__ = "AppSettings"

    SettingID = Column(Integer, primary_key=True, autoincrement=True)
    SettingKey = Column(String(100), nullable=False, unique=True)
    SettingValue = Column(Text, nullable=True)
    SettingCategory = Column(String(50), default="General")


class ActivityLog(Base):
    __tablename__ = "ActivityLogs"

    LogID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, nullable=False)
    ActivityType = Column(String(100), nullable=False)
    EntityType = Column(String(100), nullable=True)
    EntityID = Column(Integer, nullable=True)
    Description = Column(Text, nullable=True)
    IPAddress = Column(String(50), nullable=True)
    ActivityDate = Column(DateTime, default=datetime.utcnow)


class Currency(Base):
    __tablename__ = "Currencies"

    CurrencyID = Column(Integer, primary_key=True, autoincrement=True)
    CurrencyCode = Column(String(10), nullable=False, unique=True)
    CurrencyName = Column(String(50), nullable=False)
    CurrencySymbol = Column(String(10), nullable=True)
    IsBase = Column(Boolean, default=False)
    
    # Manual rate
    ManualRate = Column(Numeric(18, 4), default=1.0)
    ManualRateDate = Column(String(20), nullable=True)
    
    # Online rates (3 Sources)
    CbiRate = Column(Numeric(18, 4), default=1.0)              # نرخ اینترنتی بانک مرکزی (سنا / نیما)
    CbiRateDate = Column(String(20), nullable=True)
    TgjuRate = Column(Numeric(18, 4), default=1.0)             # نرخ اینترنتی شبکه اطلاع‌رسانی طلا، سکه و ارز
    TgjuRateDate = Column(String(20), nullable=True)
    GlobalRate = Column(Numeric(18, 4), default=1.0)           # نرخ اینترنتی سرویس بین‌المللی Forex
    GlobalRateDate = Column(String(20), nullable=True)
    
    # Standard fallback / active selected online rate
    OnlineRate = Column(Numeric(18, 4), default=1.0)
    OnlineRateDate = Column(String(20), nullable=True)
    
    IsActive = Column(Boolean, default=True)
    CreatedDate = Column(DateTime, default=datetime.utcnow)


