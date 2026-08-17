-- =============================================================================
-- Negar Web Software - PostgreSQL Database Schema Script
-- Database: negar_db
-- Encoding: UTF8
-- Description: Complete schema for Users, Permissions, Companies, Fiscal Years,
--              Products, Warehouses, Inventory, Invoices, Chart of Accounts,
--              Journal Entries (Sanad), Reports, and App Settings.
-- =============================================================================

CREATE TABLE IF NOT EXISTS "Users" (
    "UserID" SERIAL PRIMARY KEY,
    "Username" VARCHAR(100) NOT NULL UNIQUE,
    "Password" VARCHAR(255) NOT NULL,
    "UserType" VARCHAR(50) NOT NULL DEFAULT 'User', -- SuperAdmin, Manager, User
    "CreatedBy" INT NULL,
    "CreatedDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN DEFAULT TRUE,
    "FullName" VARCHAR(150),
    "CreatorIP" VARCHAR(50),
    "MaxCompaniesAllowed" INT DEFAULT 0,
    "MaxFiscalYearsPerCompany" INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "Permissions" (
    "PermissionID" SERIAL PRIMARY KEY,
    "PermissionName" VARCHAR(150) NOT NULL,
    "PermissionKey" VARCHAR(100) NOT NULL UNIQUE,
    "SectionName" VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS "RolePermissions" (
    "RolePermID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "PermissionID" INT NOT NULL REFERENCES "Permissions"("PermissionID") ON DELETE CASCADE,
    "CanView" BOOLEAN DEFAULT TRUE,
    "CanCreate" BOOLEAN DEFAULT FALSE,
    "CanEdit" BOOLEAN DEFAULT FALSE,
    "CanDelete" BOOLEAN DEFAULT FALSE,
    "CanPrint" BOOLEAN DEFAULT FALSE,
    "CanExport" BOOLEAN DEFAULT FALSE,
    CONSTRAINT "UQ_RolePermissions_User_Perm" UNIQUE ("UserID", "PermissionID")
);

CREATE TABLE IF NOT EXISTS "Companies" (
    "CompanyID" SERIAL PRIMARY KEY,
    "CompanyName" VARCHAR(200) NOT NULL,
    "CompanyCode" VARCHAR(50),
    "BrandName" VARCHAR(200),
    "EconomicCode" VARCHAR(50),
    "FiscalYearStartDate" TIMESTAMP WITH TIME ZONE,
    "FiscalYearEndDate" TIMESTAMP WITH TIME ZONE,
    "PostalCode" VARCHAR(20),
    "RegistrationDate" TIMESTAMP WITH TIME ZONE,
    "RegistrationNumber" VARCHAR(50),
    "ActivityField" VARCHAR(250),
    "Address" TEXT,
    "Phone" VARCHAR(50),
    "Phone2" VARCHAR(50),
    "Email" VARCHAR(100),
    "TaxID" VARCHAR(50),
    "LogoImage" BYTEA,
    "ChairmanName" VARCHAR(150),
    "InspectorName" VARCHAR(150),
    "CEOName" VARCHAR(150),
    "Signatory1Title" VARCHAR(100),
    "Signatory1Name" VARCHAR(150),
    "Signatory2Title" VARCHAR(100),
    "Signatory2Name" VARCHAR(150),
    "Signatory3Title" VARCHAR(100),
    "Signatory3Name" VARCHAR(150),
    "Signatory4Title" VARCHAR(100),
    "Signatory4Name" VARCHAR(150),
    "OwnerUserID" INT REFERENCES "Users"("UserID") ON DELETE SET NULL,
    "AccountLevels" INT DEFAULT 4,
    "Level1Length" INT DEFAULT 2,
    "Level2Length" INT DEFAULT 2,
    "Level3Length" INT DEFAULT 2,
    "Level4Length" INT DEFAULT 2,
    "Level5Length" INT DEFAULT 2,
    "ProductGroupLevels" INT DEFAULT 3,
    "LogoPosition" VARCHAR(50) DEFAULT 'Right',
    "IsActive" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "FiscalYears" (
    "FiscalYearID" SERIAL PRIMARY KEY,
    "CompanyID" INT NOT NULL REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "FiscalYearName" VARCHAR(100) NOT NULL,
    "StartDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "EndDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "IsActive" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "ProductGroups" (
    "GroupID" SERIAL PRIMARY KEY,
    "CompanyID" INT NOT NULL REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "ParentID" INT NULL REFERENCES "ProductGroups"("GroupID") ON DELETE CASCADE,
    "GroupCode" VARCHAR(50) NOT NULL,
    "GroupName" VARCHAR(150) NOT NULL,
    "Level" INT NOT NULL DEFAULT 1,
    "IsActive" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "Products" (
    "ProductID" SERIAL PRIMARY KEY,
    "CompanyID" INT REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "ProductCode" VARCHAR(50) NOT NULL UNIQUE,
    "ProductName" VARCHAR(200) NOT NULL,
    "Unit" VARCHAR(50) DEFAULT 'عدد',
    "DefaultPrice" NUMERIC(18, 2) DEFAULT 0,
    "Category" VARCHAR(100),
    "IsActive" BOOLEAN DEFAULT TRUE,
    "BaseUoMID" INT NULL,
    "IsCatchWeight" BOOLEAN DEFAULT FALSE,
    "SecondaryUoMID" INT NULL,
    "NominalFactor" NUMERIC(18, 4) DEFAULT 1,
    "ProductGroupID" INT NULL REFERENCES "ProductGroups"("GroupID") ON DELETE SET NULL,
    "Barcode" VARCHAR(100),
    "TaxID" VARCHAR(50),
    "ProductType" VARCHAR(50) DEFAULT 'کالا',
    "PurchasePrice" NUMERIC(18, 2) DEFAULT 0,
    "MinStock" NUMERIC(18, 4) DEFAULT 0,
    "ReorderPoint" NUMERIC(18, 4) DEFAULT 0,
    "MaxStock" NUMERIC(18, 4) DEFAULT 0,
    "TrackingType" VARCHAR(50) DEFAULT 'عادی',
    "LocationID" INT NULL,
    "TechnicalName" VARCHAR(200),
    "ConsumerMarkup" NUMERIC(18, 2) DEFAULT 0,
    "ConsumerDiscount" NUMERIC(18, 2) DEFAULT 0,
    "ColleagueMarkup" NUMERIC(18, 2) DEFAULT 0,
    "ColleagueDiscount" NUMERIC(18, 2) DEFAULT 0,
    "WholesaleMarkup" NUMERIC(18, 2) DEFAULT 0,
    "WholesaleDiscount" NUMERIC(18, 2) DEFAULT 0,
    "TaxPercent" NUMERIC(5, 2) DEFAULT 0,
    "TollPercent" NUMERIC(5, 2) DEFAULT 0,
    "NetWeight" NUMERIC(18, 4) DEFAULT 0,
    "GrossWeight" NUMERIC(18, 4) DEFAULT 0,
    "Length" NUMERIC(18, 2) DEFAULT 0,
    "Width" NUMERIC(18, 2) DEFAULT 0,
    "Height" NUMERIC(18, 2) DEFAULT 0,
    "Volume" NUMERIC(18, 2) DEFAULT 0,
    "Color" VARCHAR(50),
    "Material" VARCHAR(50),
    "Size" VARCHAR(50),
    "Brand" VARCHAR(100),
    "CountryOfOrigin" VARCHAR(100),
    "PhysicalDescription" TEXT,
    "Image1" TEXT
);

CREATE TABLE IF NOT EXISTS "WarehouseTypes" (
    "TypeID" SERIAL PRIMARY KEY,
    "TypeName" VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "Warehouses" (
    "WarehouseID" SERIAL PRIMARY KEY,
    "CompanyID" INT REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "WarehouseName" VARCHAR(150) NOT NULL,
    "Location" VARCHAR(250),
    "IsActive" BOOLEAN DEFAULT TRUE,
    "WarehouseType" VARCHAR(100) DEFAULT 'عمومی',
    "Phone" VARCHAR(50),
    "Phone2" VARCHAR(50),
    "Phone3" VARCHAR(50),
    "PostalCode" VARCHAR(20),
    "Capacity" NUMERIC(18, 2) DEFAULT 0,
    "WarehouseKeeper" VARCHAR(150),
    "CostCenter" VARCHAR(100),
    "AllowNegativeStock" BOOLEAN DEFAULT FALSE,
    "Description" TEXT
);

CREATE TABLE IF NOT EXISTS "WarehouseLocations" (
    "LocationID" SERIAL PRIMARY KEY,
    "WarehouseID" INT NOT NULL REFERENCES "Warehouses"("WarehouseID") ON DELETE CASCADE,
    "ParentID" INT NULL REFERENCES "WarehouseLocations"("LocationID") ON DELETE CASCADE,
    "LocationType" INT NOT NULL DEFAULT 1, -- 1:Salon, 2:Section, 3:Aisle, 4:Shelf, 5:Row, 6:Box
    "Title" VARCHAR(150) NOT NULL,
    "Code" VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Inventory" (
    "InventoryID" SERIAL PRIMARY KEY,
    "ProductID" INT NOT NULL REFERENCES "Products"("ProductID") ON DELETE CASCADE,
    "WarehouseID" INT NOT NULL REFERENCES "Warehouses"("WarehouseID") ON DELETE CASCADE,
    "Quantity" NUMERIC(18, 4) DEFAULT 0,
    "AverageCost" NUMERIC(18, 2) DEFAULT 0,
    "LastUpdate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_Inventory_Product_Warehouse" UNIQUE ("ProductID", "WarehouseID")
);

CREATE TABLE IF NOT EXISTS "PurchaseInvoices" (
    "InvoiceID" SERIAL PRIMARY KEY,
    "CompanyID" INT REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "InvoiceNumber" VARCHAR(50) NOT NULL UNIQUE,
    "InvoiceDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "VendorName" VARCHAR(200),
    "TotalAmount" NUMERIC(18, 2) DEFAULT 0,
    "CreatedBy" INT REFERENCES "Users"("UserID") ON DELETE SET NULL,
    "WarehouseID" INT REFERENCES "Warehouses"("WarehouseID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "PurchaseInvoiceDetails" (
    "DetailID" SERIAL PRIMARY KEY,
    "InvoiceID" INT NOT NULL REFERENCES "PurchaseInvoices"("InvoiceID") ON DELETE CASCADE,
    "ProductID" INT NOT NULL REFERENCES "Products"("ProductID") ON DELETE RESTRICT,
    "Quantity" NUMERIC(18, 4) NOT NULL DEFAULT 1,
    "UnitPrice" NUMERIC(18, 2) NOT NULL DEFAULT 0,
    "TotalPrice" NUMERIC(18, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "SalesInvoices" (
    "InvoiceID" SERIAL PRIMARY KEY,
    "CompanyID" INT REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "InvoiceNumber" VARCHAR(50) NOT NULL UNIQUE,
    "InvoiceDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "CustomerName" VARCHAR(200),
    "TotalAmount" NUMERIC(18, 2) DEFAULT 0,
    "CreatedBy" INT REFERENCES "Users"("UserID") ON DELETE SET NULL,
    "WarehouseID" INT REFERENCES "Warehouses"("WarehouseID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "SalesInvoiceDetails" (
    "DetailID" SERIAL PRIMARY KEY,
    "InvoiceID" INT NOT NULL REFERENCES "SalesInvoices"("InvoiceID") ON DELETE CASCADE,
    "ProductID" INT NOT NULL REFERENCES "Products"("ProductID") ON DELETE RESTRICT,
    "Quantity" NUMERIC(18, 4) NOT NULL DEFAULT 1,
    "UnitPrice" NUMERIC(18, 2) NOT NULL DEFAULT 0,
    "TotalPrice" NUMERIC(18, 2) NOT NULL DEFAULT 0,
    "CostAtSaleTime" NUMERIC(18, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "SarfaslHesab" (
    "AccountID" SERIAL PRIMARY KEY,
    "CompanyID" INT NOT NULL REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "AccountCode" VARCHAR(50) NOT NULL,
    "AccountName" VARCHAR(200) NOT NULL,
    "AccountType" VARCHAR(50) NOT NULL, -- گروه, کل, معین, تفصیلی
    "ParentAccountID" INT NULL REFERENCES "SarfaslHesab"("AccountID") ON DELETE CASCADE,
    "IsActive" BOOLEAN DEFAULT TRUE,
    "AccountNature" VARCHAR(50) DEFAULT 'بدهکار/بستانکار', -- بدهکار, بستانکار, خنثی
    CONSTRAINT "UQ_SarfaslHesab_Company_Code" UNIQUE ("CompanyID", "AccountCode")
);

CREATE TABLE IF NOT EXISTS "SarfaslShenavar" (
    "ShenavarID" SERIAL PRIMARY KEY,
    "CompanyID" INT NOT NULL REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "AccountCode" VARCHAR(50) NOT NULL,
    "AccountName" VARCHAR(200) NOT NULL,
    "ParentShenavarID" INT NULL REFERENCES "SarfaslShenavar"("ShenavarID") ON DELETE CASCADE,
    "IsActive" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "Bakhsh" (
    "BakhshID" SERIAL PRIMARY KEY,
    "BakhshCode" INT NOT NULL UNIQUE,
    "BakhshName" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Sanad1" (
    "EntryID" SERIAL PRIMARY KEY,
    "CompanyID" INT NOT NULL REFERENCES "Companies"("CompanyID") ON DELETE CASCADE,
    "FiscalYearID" INT NOT NULL REFERENCES "FiscalYears"("FiscalYearID") ON DELETE CASCADE,
    "EntryDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "Description" TEXT,
    "ReferenceNumber" VARCHAR(50),
    "CreatedBy" INT REFERENCES "Users"("UserID") ON DELETE SET NULL,
    "JamBedehkar" NUMERIC(18, 2) DEFAULT 0,
    "JamBestankar" NUMERIC(18, 2) DEFAULT 0,
    "TaeazSanad" VARCHAR(50) DEFAULT 'متوازن',
    "SharhSanad" TEXT,
    "VazeiatSanad" VARCHAR(50) DEFAULT 'یادداشت', -- یادداشت, موقت, دائم
    "AdamVirayesh" BOOLEAN DEFAULT FALSE,
    "BakhshID" INT NULL REFERENCES "Bakhsh"("BakhshID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Sanad2" (
    "DetailID" SERIAL PRIMARY KEY,
    "EntryID" INT NOT NULL REFERENCES "Sanad1"("EntryID") ON DELETE CASCADE,
    "AccountID" INT NOT NULL REFERENCES "SarfaslHesab"("AccountID") ON DELETE RESTRICT,
    "DebitAmount" NUMERIC(18, 2) DEFAULT 0,
    "CreditAmount" NUMERIC(18, 2) DEFAULT 0,
    "LineNumber" INT NOT NULL DEFAULT 1,
    "ShenavarID" INT NULL REFERENCES "SarfaslShenavar"("ShenavarID") ON DELETE SET NULL,
    "SharhRadif" TEXT,
    "TransactionNumber" VARCHAR(100),
    "TransactionDate" VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "LogID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "ActivityType" VARCHAR(100) NOT NULL,
    "EntityType" VARCHAR(100),
    "EntityID" INT,
    "Description" TEXT,
    "IPAddress" VARCHAR(50),
    "ActivityDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AppSettings" (
    "SettingID" SERIAL PRIMARY KEY,
    "SettingKey" VARCHAR(100) NOT NULL UNIQUE,
    "SettingValue" TEXT,
    "SettingCategory" VARCHAR(100) DEFAULT 'General'
);

-- Initial Data Seeding
INSERT INTO "Users" ("Username", "Password", "UserType", "IsActive", "FullName")
VALUES ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'SuperAdmin', TRUE, 'مدیر ارشد سیستم')
ON CONFLICT ("Username") DO NOTHING;

INSERT INTO "Companies" ("CompanyName", "CompanyCode", "EconomicCode", "IsActive")
VALUES ('شرکت نمونه نگار', '1001', '411111111111', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO "FiscalYears" ("CompanyID", "FiscalYearName", "StartDate", "EndDate", "IsActive")
VALUES (1, 'سال مالی ۱۴۰۳', '2024-03-20 00:00:00+00', '2025-03-20 23:59:59+00', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO "Warehouses" ("CompanyID", "WarehouseName", "Location", "IsActive")
VALUES (1, 'انبار مرکزی', 'تهران - دفتر مرکزی', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO "Permissions" ("PermissionName", "PermissionKey", "SectionName") VALUES
('مدیریت کاربران', 'ManageUsers', 'مدیریت سیستم'),
('مدیریت کالاها', 'ManageProducts', 'انبارداری'),
('مدیریت انبارها', 'ManageWarehouses', 'انبارداری'),
('ثبت و مدیریت خرید', 'ManagePurchases', 'خرید و فروش'),
('ثبت و مدیریت فروش', 'ManageSales', 'خرید و فروش'),
('مشاهده موجودی انبار', 'ViewInventory', 'انبارداری'),
('مدیریت حسابداری', 'ManageAccounting', 'حسابداری'),
('مدیریت شرکت‌ها و سال‌های مالی', 'ManageCompaniesYears', 'مدیریت سیستم'),
('مشاهده گزارش‌ها', 'ViewReports', 'گزارش‌گیری'),
('تنظیمات سیستم', 'ManageSettings', 'مدیریت سیستم')
ON CONFLICT ("PermissionKey") DO NOTHING;

INSERT INTO "RolePermissions" ("UserID", "PermissionID", "CanView", "CanCreate", "CanEdit", "CanDelete", "CanPrint", "CanExport")
SELECT 1, "PermissionID", TRUE, TRUE, TRUE, TRUE, TRUE, TRUE FROM "Permissions"
ON CONFLICT ("UserID", "PermissionID") DO NOTHING;

-- Seeding accounts with hierarchical parent-child relationships using subqueries
INSERT INTO "SarfaslHesab" ("CompanyID", "AccountCode", "AccountName", "AccountType", "AccountNature", "ParentAccountID") VALUES
(1, '01', 'دارایی‌های جاری', 'گروه', 'بدهکار', NULL),
(1, '02', 'بدهی‌های جاری', 'گروه', 'بستانکار', NULL),
(1, '03', 'حقوق صاحبان سهام', 'گروه', 'بستانکار', NULL),
(1, '04', 'درآمدها', 'گروه', 'بستانکار', NULL),
(1, '05', 'هزینه‌ها', 'گروه', 'بدهکار', NULL)
ON CONFLICT ("CompanyID", "AccountCode") DO NOTHING;

INSERT INTO "SarfaslHesab" ("CompanyID", "AccountCode", "AccountName", "AccountType", "AccountNature", "ParentAccountID") VALUES
(1, '0110', 'موجودی نقد و بانک', 'کل', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '01')),
(1, '0111', 'حساب‌های دریافتنی', 'کل', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '01')),
(1, '0112', 'موجودی کالا', 'کل', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '01')),
(1, '0220', 'حساب‌های پرداختنی', 'کل', 'بستانکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '02')),
(1, '0330', 'سرمایه اول دوره', 'کل', 'بستانکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '03')),
(1, '0440', 'فروش کالا و خدمات', 'کل', 'بستانکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '04')),
(1, '0550', 'بهای تمام شده کالای فروش رفته', 'کل', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '05')),
(1, '0551', 'هزینه‌های عمومی و اداری', 'کل', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '05'))
ON CONFLICT ("CompanyID", "AccountCode") DO NOTHING;

INSERT INTO "SarfaslHesab" ("CompanyID", "AccountCode", "AccountName", "AccountType", "AccountNature", "ParentAccountID") VALUES
(1, '011001', 'صندوق مرکزی', 'معین', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '0110')),
(1, '011002', 'بانک ملی شعبه مرکزی', 'معین', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '0110')),
(1, '011101', 'مشتریان تجاری', 'معین', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '0111')),
(1, '011201', 'موجودی انبار مرکزی', 'معین', 'بدهکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '0112')),
(1, '022001', 'فروشندگان و تامین کنندگان', 'معین', 'بستانکار', (SELECT "AccountID" FROM "SarfaslHesab" WHERE "CompanyID" = 1 AND "AccountCode" = '0220'))
ON CONFLICT ("CompanyID", "AccountCode") DO NOTHING;

-- Seeding floating accounts with hierarchical parent-child relationships using subqueries
INSERT INTO "SarfaslShenavar" ("CompanyID", "AccountCode", "AccountName", "ParentShenavarID") VALUES
(1, 'SH-101', 'پروژه احداث شعبه غرب', NULL),
(1, 'SH-102', 'مرکز هزینه کارخانه ۱', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO "SarfaslShenavar" ("CompanyID", "AccountCode", "AccountName", "ParentShenavarID") VALUES
(1, 'SH-101-01', 'فاز ۱ سازه بتنی', (SELECT "ShenavarID" FROM "SarfaslShenavar" WHERE "CompanyID" = 1 AND "AccountCode" = 'SH-101')),
(1, 'SH-101-02', 'فاز ۲ محوطه‌سازی', (SELECT "ShenavarID" FROM "SarfaslShenavar" WHERE "CompanyID" = 1 AND "AccountCode" = 'SH-101'))
ON CONFLICT DO NOTHING;

INSERT INTO "Bakhsh" ("BakhshCode", "BakhshName") VALUES
(1, 'حسابداری'),
(2, 'خرید و فروش'),
(3, 'انبارداری'),
(4, 'حقوق و دستمزد'),
(5, 'خزانه‌داری'),
(6, 'بودجه و هزینه'),
(7, 'اموال')
ON CONFLICT ("BakhshCode") DO NOTHING;

INSERT INTO "AppSettings" ("SettingKey", "SettingValue", "SettingCategory") VALUES
('CurrentTheme', 'Blue', 'UI'),
('AllowNegativeStock', 'False', 'Inventory'),
('DefaultCurrency', 'ریال', 'Accounting'),
('CompanyName', 'نرم‌افزار جامع مدیریت نگار تحت وب', 'General')
ON CONFLICT ("SettingKey") DO NOTHING;
