from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# =============================================================================
# Auth Schemas
# =============================================================================
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    userID: Optional[int] = None
    username: Optional[str] = None
    fullName: Optional[str] = None
    userType: Optional[str] = None
    token: Optional[str] = None


# =============================================================================
# Dashboard Schemas
# =============================================================================
class DashboardSummary(BaseModel):
    totalCompanies: int = 0
    totalUsers: int = 0
    totalProducts: int = 0
    totalWarehouses: int = 0
    totalInvoices: int = 0
    totalSanadEntries: int = 0
    totalSalesAmount: float = 0.0
    totalPurchaseAmount: float = 0.0


# =============================================================================
# User Schemas
# =============================================================================
class UserAccountBase(BaseModel):
    Username: str
    UserType: str = "User"
    IsActive: bool = True
    FullName: Optional[str] = None
    MaxCompaniesAllowed: int = 0
    MaxFiscalYearsPerCompany: int = 0


class UserAccountCreateDTO(UserAccountBase):
    Password: str


class UserAccountDTO(UserAccountBase):
    UserID: int
    CreatedDate: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# Company & Fiscal Year Schemas
# =============================================================================
class CompanyBase(BaseModel):
    CompanyName: str
    CompanyCode: Optional[str] = None
    BrandName: Optional[str] = None
    EconomicCode: Optional[str] = None
    FiscalYearStartDate: Optional[datetime] = None
    FiscalYearEndDate: Optional[datetime] = None
    PostalCode: Optional[str] = None
    ActivityField: Optional[str] = None
    Address: Optional[str] = None
    Phone: Optional[str] = None
    Email: Optional[str] = None
    TaxID: Optional[str] = None
    ChairmanName: Optional[str] = None
    InspectorName: Optional[str] = None
    CEOName: Optional[str] = None
    AccountLevels: int = 4
    Level1Length: int = 2
    Level2Length: int = 2
    Level3Length: int = 2
    Level4Length: int = 2
    Level5Length: int = 2
    ProductGroupLevels: int = 3
    IsActive: bool = True


class CompanyCreateDTO(CompanyBase):
    pass


class CompanyDTO(CompanyBase):
    CompanyID: int

    class Config:
        from_attributes = True


class FiscalYearDTO(BaseModel):
    FiscalYearID: int
    CompanyID: int
    FiscalYearName: str
    StartDate: datetime
    EndDate: datetime
    IsActive: bool = True

    class Config:
        from_attributes = True


# =============================================================================
# Accounting Schemas
# =============================================================================
class AccountBase(BaseModel):
    CompanyID: int
    AccountCode: str
    AccountName: str
    AccountType: str = "معین"
    ParentAccountID: Optional[int] = None
    IsActive: bool = True
    AccountNature: str = "بدهکار/بستانکار"


class AccountCreateDTO(AccountBase):
    AccountID: Optional[int] = None


class AccountDTO(AccountBase):
    AccountID: int

    class Config:
        from_attributes = True


class SanadDetailBase(BaseModel):
    AccountID: int
    DebitAmount: float = 0.0
    CreditAmount: float = 0.0
    LineNumber: int = 1
    ShenavarID: Optional[int] = None
    SharhRadif: Optional[str] = None
    TransactionNumber: Optional[str] = None
    TransactionDate: Optional[str] = None


class SanadDetailDTO(SanadDetailBase):
    DetailID: Optional[int] = None
    EntryID: Optional[int] = None
    Account: Optional[AccountDTO] = None

    class Config:
        from_attributes = True


class SanadHeaderBase(BaseModel):
    CompanyID: int
    FiscalYearID: int
    EntryDate: Optional[datetime] = None
    Description: Optional[str] = None
    ReferenceNumber: Optional[str] = None
    CreatedBy: Optional[int] = None
    SharhSanad: Optional[str] = None
    VazeiatSanad: str = "یادداشت"
    AdamVirayesh: bool = False


class SanadHeaderCreateDTO(SanadHeaderBase):
    EntryID: Optional[int] = None
    Details: List[SanadDetailBase] = []


class SanadHeaderDTO(SanadHeaderBase):
    EntryID: int
    JamBedehkar: float = 0.0
    JamBestankar: float = 0.0
    TaeazSanad: str = "متوازن"
    Details: List[SanadDetailDTO] = []

    class Config:
        from_attributes = True


# =============================================================================
# Inventory & Product Schemas
# =============================================================================
class ProductBase(BaseModel):
    CompanyID: Optional[int] = None
    ProductCode: str
    ProductName: str
    Unit: str = "عدد"
    DefaultPrice: float = 0.0
    Category: Optional[str] = None
    IsActive: bool = True
    ProductGroupID: Optional[int] = None
    Barcode: Optional[str] = None
    ProductType: str = "کالا"
    PurchasePrice: float = 0.0
    MinStock: float = 0.0
    ReorderPoint: float = 0.0
    MaxStock: float = 0.0
    TrackingType: str = "عادی"
    TechnicalName: Optional[str] = None
    TaxPercent: float = 0.0
    TollPercent: float = 0.0


class ProductCreateDTO(ProductBase):
    ProductID: Optional[int] = None


class ProductDTO(ProductBase):
    ProductID: int

    class Config:
        from_attributes = True


class WarehouseBase(BaseModel):
    CompanyID: Optional[int] = None
    WarehouseName: str
    Location: Optional[str] = None
    IsActive: bool = True
    WarehouseType: str = "عمومی"
    Phone: Optional[str] = None
    WarehouseKeeper: Optional[str] = None
    AllowNegativeStock: bool = False
    Description: Optional[str] = None


class WarehouseCreateDTO(WarehouseBase):
    WarehouseID: Optional[int] = None


class WarehouseDTO(WarehouseBase):
    WarehouseID: int

    class Config:
        from_attributes = True


class InventoryRecordDTO(BaseModel):
    InventoryID: int
    ProductID: int
    WarehouseID: int
    Quantity: float = 0.0
    AverageCost: float = 0.0
    LastUpdate: Optional[datetime] = None
    Product: Optional[ProductDTO] = None
    Warehouse: Optional[WarehouseDTO] = None

    class Config:
        from_attributes = True
