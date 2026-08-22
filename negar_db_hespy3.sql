BEGIN TRANSACTION;
CREATE TABLE "ActivityLogs" (
	"LogID" INTEGER NOT NULL, 
	"UserID" INTEGER NOT NULL, 
	"ActivityType" VARCHAR(100) NOT NULL, 
	"EntityType" VARCHAR(100), 
	"EntityID" INTEGER, 
	"Description" TEXT, 
	"IPAddress" VARCHAR(50), 
	"ActivityDate" DATETIME, 
	PRIMARY KEY ("LogID")
);
CREATE TABLE "AppSettings" (
	"SettingID" INTEGER NOT NULL, 
	"SettingKey" VARCHAR(100) NOT NULL, 
	"SettingValue" TEXT, 
	"SettingCategory" VARCHAR(50), 
	PRIMARY KEY ("SettingID"), 
	UNIQUE ("SettingKey")
);
INSERT INTO "AppSettings" VALUES(1,'AppTheme','blue','Appearance');
CREATE TABLE "Companies" (
	"CompanyID" INTEGER NOT NULL, 
	"CompanyName" VARCHAR(200) NOT NULL, 
	"CompanyCode" VARCHAR(50), 
	"BrandName" VARCHAR(200), 
	"EconomicCode" VARCHAR(50), 
	"FiscalYearStartDate" DATETIME, 
	"FiscalYearEndDate" DATETIME, 
	"PostalCode" VARCHAR(20), 
	"RegistrationDate" DATETIME, 
	"RegistrationNumber" VARCHAR(50), 
	"ActivityField" VARCHAR(250), 
	"Address" TEXT, 
	"Phone" VARCHAR(50), 
	"Phone2" VARCHAR(50), 
	"Email" VARCHAR(100), 
	"TaxID" VARCHAR(50), 
	"LogoImage" BLOB, 
	"ChairmanName" VARCHAR(150), 
	"InspectorName" VARCHAR(150), 
	"CEOName" VARCHAR(150), 
	"OwnerUserID" INTEGER, 
	"AccountLevels" INTEGER, 
	"Level1Length" INTEGER, 
	"Level2Length" INTEGER, 
	"Level3Length" INTEGER, 
	"Level4Length" INTEGER, 
	"Level5Length" INTEGER, 
	"ProductGroupLevels" INTEGER, 
	"IsActive" BOOLEAN, 
	PRIMARY KEY ("CompanyID"), 
	FOREIGN KEY("OwnerUserID") REFERENCES "Users" ("UserID") ON DELETE SET NULL
);
INSERT INTO "Companies" VALUES(1,'شرکت نمونه نگار','101','نگار','123456789012',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,4,2,2,2,2,2,3,1);
CREATE TABLE "Currencies" (
	"CurrencyID" INTEGER NOT NULL, 
	"CurrencyCode" VARCHAR(10) NOT NULL, 
	"CurrencyName" VARCHAR(50) NOT NULL, 
	"CurrencySymbol" VARCHAR(10), 
	"IsBase" BOOLEAN, 
	"ManualRate" NUMERIC(18, 4), 
	"ManualRateDate" VARCHAR(20), 
	"OnlineRate" NUMERIC(18, 4), 
	"OnlineRateDate" VARCHAR(20), 
	"IsActive" BOOLEAN, 
	"CreatedDate" DATETIME, CbiRate NUMERIC(18, 4) DEFAULT 1.0, CbiRateDate VARCHAR(20), TgjuRate NUMERIC(18, 4) DEFAULT 1.0, TgjuRateDate VARCHAR(20), GlobalRate NUMERIC(18, 4) DEFAULT 1.0, GlobalRateDate VARCHAR(20), 
	PRIMARY KEY ("CurrencyID"), 
	UNIQUE ("CurrencyCode")
);
INSERT INTO "Currencies" VALUES(1,'IRR','ریال ایران','﷼',1,1,'1405/05/27',1,'1405/05/27',1,'2026-08-18 01:41:47.016326',1,'1405/05/27',1,'1405/05/27',1,'1405/05/27');
INSERT INTO "Currencies" VALUES(2,'TMN','تومان','تومان',0,10,'1405/05/27',10,'1405/05/27',1,'2026-08-18 01:41:47.016326',10,'1405/05/27',10,'1405/05/27',7.1942,'1405/05/27');
INSERT INTO "Currencies" VALUES(3,'USD','دلار آمریکا','$',0,200,'1405/05/27',1865000,'1405/05/27',1,'2026-08-18 01:41:47.016326',1541360,'1405/05/27',1865000,'1405/05/27',1341726.6187,'1405/05/27');
INSERT INTO "Currencies" VALUES(4,'EUR','یورو','€',0,665000,'1405/05/27',2158000,'1405/05/27',1,'2026-08-18 01:41:47.016326',1884530,'1405/05/27',2158000,'1405/05/27',1554493.2158,'1405/05/27');
INSERT INTO "Currencies" VALUES(5,'AED','درهم امارات','د.إ',0,168000,'1405/05/27',507890,'1405/05/27',1,'2026-08-18 01:41:47.016326',419650,'1405/05/27',507890,'1405/05/27',365344.2086,'1405/05/27');
INSERT INTO "Currencies" VALUES(6,'TRY','لیر ترکیه','₺',0,18800,'1405/05/27',39000,'1405/05/27',1,'2026-08-18 01:41:47.016326',32500,'1405/05/27',39000,'1405/05/27',28015.3165,'1405/05/27');
INSERT INTO "Currencies" VALUES(7,'CNY','یوان چین','¥',0,86000,'1405/05/27',277800,'1405/05/27',1,'2026-08-18 01:41:47.016326',215000,'1405/05/27',277800,'1405/05/27',198681.6547,'1405/05/27');
INSERT INTO "Currencies" VALUES(8,'GBP','پوند انگلیس','£',0,775000,'1405/05/27',2529800,'1405/05/27',1,'2026-08-18 01:41:47.016326',2098000,'1405/05/27',2529800,'1405/05/27',1818311.5252,'1405/05/27');
INSERT INTO "Currencies" VALUES(9,'CAD','دلار کانادا','C$',0,450000,'1405/05/27',452000,'1405/05/27',1,'2026-08-18 01:41:47.411143',1,'1405/05/28',1,'1405/05/28',1,'1405/05/28');
CREATE TABLE "FiscalYears" (
	"FiscalYearID" INTEGER NOT NULL, 
	"CompanyID" INTEGER NOT NULL, 
	"FiscalYearName" VARCHAR(100) NOT NULL, 
	"StartDate" DATETIME NOT NULL, 
	"EndDate" DATETIME NOT NULL, 
	"IsActive" BOOLEAN, 
	PRIMARY KEY ("FiscalYearID"), 
	FOREIGN KEY("CompanyID") REFERENCES "Companies" ("CompanyID") ON DELETE CASCADE
);
INSERT INTO "FiscalYears" VALUES(1,1,'سال مالی ۱۴۰۵','2026-03-21 00:00:00.000000','2027-03-20 00:00:00.000000',1);
CREATE TABLE "Inventory" (
	"InventoryID" INTEGER NOT NULL, 
	"ProductID" INTEGER NOT NULL, 
	"WarehouseID" INTEGER NOT NULL, 
	"Quantity" NUMERIC(18, 4), 
	"AverageCost" NUMERIC(18, 2), 
	"LastUpdate" DATETIME, 
	PRIMARY KEY ("InventoryID"), 
	FOREIGN KEY("ProductID") REFERENCES "Products" ("ProductID") ON DELETE CASCADE, 
	FOREIGN KEY("WarehouseID") REFERENCES "Warehouses" ("WarehouseID") ON DELETE CASCADE
);
CREATE TABLE "Permissions" (
	"PermissionID" INTEGER NOT NULL, 
	"PermissionName" VARCHAR(150) NOT NULL, 
	"PermissionKey" VARCHAR(100) NOT NULL, 
	"SectionName" VARCHAR(100), 
	PRIMARY KEY ("PermissionID"), 
	UNIQUE ("PermissionKey")
);
CREATE TABLE "ProductGroups" (
	"GroupID" INTEGER NOT NULL, 
	"CompanyID" INTEGER NOT NULL, 
	"ParentID" INTEGER, 
	"GroupCode" VARCHAR(50) NOT NULL, 
	"GroupName" VARCHAR(150) NOT NULL, 
	"Level" INTEGER NOT NULL, 
	"IsActive" BOOLEAN, 
	PRIMARY KEY ("GroupID"), 
	FOREIGN KEY("CompanyID") REFERENCES "Companies" ("CompanyID") ON DELETE CASCADE, 
	FOREIGN KEY("ParentID") REFERENCES "ProductGroups" ("GroupID") ON DELETE CASCADE
);
CREATE TABLE "Products" (
	"ProductID" INTEGER NOT NULL, 
	"CompanyID" INTEGER, 
	"ProductCode" VARCHAR(50) NOT NULL, 
	"ProductName" VARCHAR(200) NOT NULL, 
	"Unit" VARCHAR(50), 
	"DefaultPrice" NUMERIC(18, 2), 
	"Category" VARCHAR(100), 
	"IsActive" BOOLEAN, 
	"ProductGroupID" INTEGER, 
	"Barcode" VARCHAR(100), 
	"ProductType" VARCHAR(50), 
	"PurchasePrice" NUMERIC(18, 2), 
	"MinStock" NUMERIC(18, 2), 
	"ReorderPoint" NUMERIC(18, 2), 
	"MaxStock" NUMERIC(18, 2), 
	"TrackingType" VARCHAR(50), 
	"TechnicalName" VARCHAR(200), 
	"TaxPercent" NUMERIC(5, 2), 
	"TollPercent" NUMERIC(5, 2), 
	PRIMARY KEY ("ProductID"), 
	FOREIGN KEY("ProductGroupID") REFERENCES "ProductGroups" ("GroupID") ON DELETE SET NULL
);
INSERT INTO "Products" VALUES(1,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(2,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(3,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(4,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(5,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(6,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(7,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(8,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(9,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(10,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(11,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(12,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(13,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(14,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(15,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(16,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
INSERT INTO "Products" VALUES(17,1,'PRD-001','لپ‌تاپ گیمینگ ایسوس','دستگاه',75000000,NULL,1,NULL,NULL,'کالا',65000000,0,0,0,'عادی',NULL,0,0);
CREATE TABLE "PurchaseInvoiceDetails" (
	"DetailID" INTEGER NOT NULL, 
	"InvoiceID" INTEGER NOT NULL, 
	"ProductID" INTEGER NOT NULL, 
	"Quantity" NUMERIC(18, 4), 
	"UnitPrice" NUMERIC(18, 2), 
	"TotalPrice" NUMERIC(18, 2), 
	PRIMARY KEY ("DetailID"), 
	FOREIGN KEY("InvoiceID") REFERENCES "PurchaseInvoices" ("InvoiceID") ON DELETE CASCADE, 
	FOREIGN KEY("ProductID") REFERENCES "Products" ("ProductID")
);
CREATE TABLE "PurchaseInvoices" (
	"InvoiceID" INTEGER NOT NULL, 
	"CompanyID" INTEGER, 
	"InvoiceNumber" VARCHAR(50) NOT NULL, 
	"InvoiceDate" DATETIME, 
	"VendorName" VARCHAR(200), 
	"TotalAmount" NUMERIC(18, 2), 
	"CreatedBy" INTEGER, 
	"WarehouseID" INTEGER, 
	PRIMARY KEY ("InvoiceID")
);
CREATE TABLE "RolePermissions" (
	"RolePermID" INTEGER NOT NULL, 
	"UserID" INTEGER NOT NULL, 
	"PermissionID" INTEGER NOT NULL, 
	"CanView" BOOLEAN, 
	"CanCreate" BOOLEAN, 
	"CanEdit" BOOLEAN, 
	"CanDelete" BOOLEAN, 
	"CanPrint" BOOLEAN, 
	"CanExport" BOOLEAN, 
	PRIMARY KEY ("RolePermID"), 
	CONSTRAINT "UQ_RolePermissions_User_Perm" UNIQUE ("UserID", "PermissionID"), 
	FOREIGN KEY("UserID") REFERENCES "Users" ("UserID") ON DELETE CASCADE, 
	FOREIGN KEY("PermissionID") REFERENCES "Permissions" ("PermissionID") ON DELETE CASCADE
);
CREATE TABLE "SalesInvoiceDetails" (
	"DetailID" INTEGER NOT NULL, 
	"InvoiceID" INTEGER NOT NULL, 
	"ProductID" INTEGER NOT NULL, 
	"Quantity" NUMERIC(18, 4), 
	"UnitPrice" NUMERIC(18, 2), 
	"TotalPrice" NUMERIC(18, 2), 
	"CostAtSaleTime" NUMERIC(18, 2), 
	PRIMARY KEY ("DetailID"), 
	FOREIGN KEY("InvoiceID") REFERENCES "SalesInvoices" ("InvoiceID") ON DELETE CASCADE, 
	FOREIGN KEY("ProductID") REFERENCES "Products" ("ProductID")
);
CREATE TABLE "SalesInvoices" (
	"InvoiceID" INTEGER NOT NULL, 
	"CompanyID" INTEGER, 
	"InvoiceNumber" VARCHAR(50) NOT NULL, 
	"InvoiceDate" DATETIME, 
	"CustomerName" VARCHAR(200), 
	"TotalAmount" NUMERIC(18, 2), 
	"CreatedBy" INTEGER, 
	"WarehouseID" INTEGER, 
	PRIMARY KEY ("InvoiceID")
);
CREATE TABLE "Sanad1" (
	"EntryID" INTEGER NOT NULL, 
	"CompanyID" INTEGER NOT NULL, 
	"FiscalYearID" INTEGER NOT NULL, 
	"EntryDate" DATETIME, 
	"Description" TEXT, 
	"ReferenceNumber" VARCHAR(50), 
	"CreatedBy" INTEGER, 
	"JamBedehkar" NUMERIC(18, 2), 
	"JamBestankar" NUMERIC(18, 2), 
	"TaeazSanad" VARCHAR(50), 
	"SharhSanad" TEXT, 
	"VazeiatSanad" VARCHAR(50), 
	"AdamVirayesh" BOOLEAN, 
	PRIMARY KEY ("EntryID")
);
INSERT INTO "Sanad1" VALUES(1,1,1,'2026-08-17 21:04:42.044357','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(2,1,1,'2026-08-17 21:41:55.832861','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(3,1,1,'2026-08-17 21:53:38.794987','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(4,1,1,'2026-08-17 22:05:46.705841','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(5,1,1,'2026-08-17 22:06:08.924176','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(6,1,1,'2026-08-18 01:19:17.312058','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(7,1,1,'2026-08-18 01:41:47.131971','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(8,1,1,'2026-08-18 01:47:13.178790','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(9,1,1,'2026-08-18 01:47:43.585707','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(10,1,1,'2026-08-18 01:53:11.721924','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(11,1,1,'2026-08-18 02:08:58.940154','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(12,1,1,'2026-08-18 02:27:20.974069','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(13,1,1,'2026-08-18 02:40:02.649949','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(14,1,1,'2026-08-18 02:51:07.709796','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(15,1,1,'2026-08-18 03:09:58.587828','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(16,1,1,'2026-08-18 03:14:45.107626','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
INSERT INTO "Sanad1" VALUES(17,1,1,'2026-08-19 13:37:30.034320','سند افتتاحیه آزمایشی',NULL,NULL,5000000,5000000,'متوازن','ثبت اولیه سرمایه و موجودی نقد','یادداشت',0);
CREATE TABLE "Sanad2" (
	"DetailID" INTEGER NOT NULL, 
	"EntryID" INTEGER NOT NULL, 
	"AccountID" INTEGER NOT NULL, 
	"DebitAmount" NUMERIC(18, 2), 
	"CreditAmount" NUMERIC(18, 2), 
	"LineNumber" INTEGER, 
	"ShenavarID" INTEGER, 
	"SharhRadif" TEXT, 
	"TransactionNumber" VARCHAR(50), 
	"TransactionDate" VARCHAR(50), 
	PRIMARY KEY ("DetailID"), 
	FOREIGN KEY("EntryID") REFERENCES "Sanad1" ("EntryID") ON DELETE CASCADE, 
	FOREIGN KEY("AccountID") REFERENCES "SarfaslHesab" ("AccountID") ON DELETE RESTRICT, 
	FOREIGN KEY("ShenavarID") REFERENCES "SarfaslShenavar" ("ShenavarID") ON DELETE SET NULL
);
INSERT INTO "Sanad2" VALUES(1,1,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(2,1,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(3,2,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(4,2,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(5,3,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(6,3,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(7,4,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(8,4,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(9,5,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(10,5,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(11,6,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(12,6,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(13,7,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(14,7,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(15,8,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(16,8,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(17,9,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(18,9,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(19,10,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(20,10,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(21,11,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(22,11,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(23,12,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(24,12,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(25,13,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(26,13,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(27,14,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(28,14,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(29,15,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(30,15,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(31,16,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(32,16,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
INSERT INTO "Sanad2" VALUES(33,17,1,5000000,0,1,NULL,'موجودی صندوق',NULL,NULL);
INSERT INTO "Sanad2" VALUES(34,17,1,0,5000000,2,NULL,'طرف حساب سرمایه',NULL,NULL);
CREATE TABLE "SarfaslHesab" (
	"AccountID" INTEGER NOT NULL, 
	"CompanyID" INTEGER NOT NULL, 
	"AccountCode" VARCHAR(50) NOT NULL, 
	"AccountName" VARCHAR(200) NOT NULL, 
	"AccountType" VARCHAR(50), 
	"ParentAccountID" INTEGER, 
	"IsActive" BOOLEAN, 
	"AccountNature" VARCHAR(50), 
	PRIMARY KEY ("AccountID"), 
	CONSTRAINT "UQ_SarfaslHesab_Company_Code" UNIQUE ("CompanyID", "AccountCode"), 
	FOREIGN KEY("ParentAccountID") REFERENCES "SarfaslHesab" ("AccountID") ON DELETE RESTRICT
);
INSERT INTO "SarfaslHesab" VALUES(1,1,'11','دارائیهای جاری','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(2,1,'12','دارائیهای غیرجاری','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(3,1,'21','بدهیهای جاری','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(4,1,'22','بدهیهای غیرجاری','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(5,1,'31','حقوق صاحبان سهام','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(6,1,'41','درآمدها','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(7,1,'42','فروش','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(8,1,'51','بهای تمام شده کالای فروش رفته','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(9,1,'52','هزینه های عمومی و اداری','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(10,1,'61','عملکرد و سود و زیان','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(11,1,'71','حسابهای انتظامی','گروه',NULL,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(12,1,'1101','موجودی نقد و بانک','کل',1,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(13,1,'1102','سرمایه‌گذاری‌های کوتاه مدت','کل',1,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(14,1,'1103','حساب‌ها و اسناد دریافتنی تجاری','کل',1,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(15,1,'1104','سایر حساب‌ها و اسناد دریافتنی','کل',1,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(16,1,'1105','موجودی مواد و کالا','کل',1,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(17,1,'1106','پیش‌پرداخت‌ها','کل',1,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(18,1,'1201','دارایی‌های ثابت مشهود','کل',2,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(19,1,'1202','استهلاک انباشته دارایی‌ها','کل',2,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(20,1,'1203','دارایی‌های نامشهود','کل',2,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(21,1,'2101','حساب‌ها و اسناد پرداختنی تجاری','کل',3,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(22,1,'2102','سایر حساب‌ها و اسناد پرداختنی','کل',3,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(23,1,'2103','پیش‌دریافت‌ها','کل',3,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(24,1,'2104','ذخایر جاری','کل',3,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(25,1,'2201','تسهیلات مالی بلندمدت','کل',4,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(26,1,'2202','ذخیره مزایای پایان خدمت پرسنل','کل',4,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(27,1,'3101','سرمایه','کل',5,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(28,1,'3102','اندوخته‌ها','کل',5,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(29,1,'3103','سود و زیان انباشته','کل',5,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(30,1,'3104','برداشت‌ها و تقسیم سود','کل',5,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(31,1,'4101','درآمدهای غیرعملیاتی','کل',6,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(32,1,'4201','فروش کالا و خدمات','کل',7,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(33,1,'4202','برگشت از فروش و تخفیفات','کل',7,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(34,1,'5101','بهای تمام شده کالای فروش رفته','کل',8,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(35,1,'5102','خرید و ملزومات','کل',8,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(36,1,'5103','هزینه‌های مستقیم حمل و نقل','کل',8,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(37,1,'5201','هزینه‌های حقوق و دستمزد','کل',9,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(38,1,'5202','هزینه‌های عمومی و اداری','کل',9,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(39,1,'5203','هزینه‌های توزیع و فروش','کل',9,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(40,1,'5204','هزینه‌های مالی','کل',9,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(41,1,'5205','هزینه استهلاک','کل',9,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(42,1,'6101','حساب خلاصه سود و زیان','کل',10,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(43,1,'6102','تعدیلات سنواتی','کل',10,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(44,1,'7101','حساب‌های انتظامی به نفع شرکت','کل',11,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(45,1,'7102','حساب‌های انتظامی به عهده شرکت','کل',11,1,'بدهکار/بستانکار');
INSERT INTO "SarfaslHesab" VALUES(46,1,'110101','صندوق‌ها','معین',12,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(47,1,'110102','بانک‌ها','معین',12,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(48,1,'110103','تنخواه‌گردان‌ها','معین',12,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(49,1,'110201','سپرده‌های بانکی کوتاه مدت','معین',13,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(50,1,'110202','سهام و اوراق بهادار کوتاه مدت','معین',13,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(51,1,'110301','حساب‌های دریافتنی (مشتریان)','معین',14,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(52,1,'110302','اسناد دریافتنی نزد صندوق','معین',14,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(53,1,'110303','اسناد دریافتنی درجریان وصول','معین',14,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(54,1,'110304','اسناد واخواست شده','معین',14,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(55,1,'110401','مساعده حقوق و دستمزد','معین',15,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(56,1,'110402','وام و مطالبات پرسنل','معین',15,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(57,1,'110403','سپرده‌های دریافتنی (ودیعه)','معین',15,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(58,1,'110501','موجودی کالا در انبار','معین',16,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(59,1,'110502','موجودی مواد اولیه','معین',16,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(60,1,'110503','موجودی قطعات و ملزومات','معین',16,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(61,1,'110504','کالای درجریان ساخت','معین',16,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(62,1,'110601','پیش‌پرداخت خرید کالا و خدمات','معین',17,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(63,1,'110602','پیش‌پرداخت اجاره','معین',17,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(64,1,'110603','پیش‌پرداخت بیمه','معین',17,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(65,1,'110604','پیش‌پرداخت مالیات و عوارض','معین',17,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(66,1,'120101','زمین','معین',18,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(67,1,'120102','ساختمان و تاسیسات','معین',18,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(68,1,'120103','ماشین‌آلات و تجهیزات','معین',18,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(69,1,'120104','وسایط نقلیه','معین',18,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(70,1,'120105','اثاثه و منصوبات','معین',18,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(71,1,'120201','استهلاک انباشته ساختمان','معین',19,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(72,1,'120202','استهلاک انباشته ماشین‌آلات','معین',19,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(73,1,'120203','استهلاک انباشته وسایط نقلیه','معین',19,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(74,1,'120204','استهلاک انباشته اثاثه','معین',19,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(75,1,'120301','نرم‌افزارهای رایانه‌ای','معین',20,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(76,1,'120302','حق‌الامتیاز و علائم تجاری','معین',20,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(77,1,'210101','حساب‌های پرداختنی (تامین‌کنندگان)','معین',21,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(78,1,'210102','اسناد پرداختنی عهده بانک‌ها','معین',21,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(79,1,'210201','حقوق و دستمزد پرداختنی','معین',22,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(80,1,'210202','بیمه پرداختنی (سازمان تامین اجتماعی)','معین',22,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(81,1,'210203','مالیات تکلیفی و حقوق پرداختنی','معین',22,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(82,1,'210204','مالیات بر ارزش افزوده پرداختنی','معین',22,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(83,1,'210301','پیش‌دریافت از مشتریان','معین',23,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(84,1,'210401','ذخیره مالیات بر درآمد','معین',24,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(85,1,'220101','وام‌ها و تسهیلات بانکی بلندمدت','معین',25,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(86,1,'220201','ذخیره بازخرید سنوات خدمت','معین',26,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(87,1,'310101','سرمایه ثبت شده','معین',27,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(88,1,'310201','اندوخته قانونی','معین',28,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(89,1,'310202','اندوخته عمومی و احتیاطی','معین',28,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(90,1,'310301','سود (زیان) انباشته','معین',29,1,'مشترک');
INSERT INTO "SarfaslHesab" VALUES(91,1,'310401','سود پیشنهادی و مصوب','معین',30,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(92,1,'410101','درآمد حاصل از سود سپرده‌های بانکی','معین',31,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(93,1,'410102','سود (زیان) حاصل از فروش دارایی‌ها','معین',31,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(94,1,'410103','سایر درآمدهای متفرقه','معین',31,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(95,1,'420101','فروش ناخالص کالا','معین',32,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(96,1,'420102','درآمد حاصل از ارائه خدمات','معین',32,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(97,1,'420201','برگشت از فروش و کاهش قیمت','معین',33,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(98,1,'420202','تخفیفات نقدی فروش','معین',33,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(99,1,'510101','بهای تمام شده کالای خریده شده / ساخته شده','معین',34,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(100,1,'510201','خرید ناخالص کالا','معین',35,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(101,1,'510202','برگشت از خرید و تخفیفات','معین',35,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(102,1,'510203','تخفیفات نقدی خرید','معین',35,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(103,1,'510301','هزینه حمل کالای خریداری شده','معین',36,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(104,1,'520101','حقوق پایه و حقوق ماهانه','معین',37,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(105,1,'520102','اضافه‌کاری و پاداش','معین',37,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(106,1,'520103','حق بیمه سهم کارفرما','معین',37,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(107,1,'520104','بن و مسکن و اولاد','معین',37,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(108,1,'520105','عیدی و پاداش پایان سال','معین',37,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(109,1,'520201','هزینه اجاره دفتر و انبار','معین',38,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(110,1,'520202','هزینه آب، برق، گاز و تلفن','معین',38,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(111,1,'520203','هزینه ملزومات و لوازم‌التحریر','معین',38,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(112,1,'520204','هزینه ایاب و ذهاب و پذیرایی','معین',38,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(113,1,'520205','هزینه پست، پیک و ارتباطات','معین',38,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(114,1,'520301','هزینه تبلیغات و بازاریابی','معین',39,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(115,1,'520302','هزینه حمل و نقل فروش','معین',39,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(116,1,'520401','هزینه کارمزد بانکی','معین',40,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(117,1,'520402','هزینه سود و کارمزد تسهیلات بانکی','معین',40,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(118,1,'520501','هزینه استهلاک دارایی‌های ثابت','معین',41,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(119,1,'610101','خلاصه سود و زیان سال جاری','معین',42,1,'مشترک');
INSERT INTO "SarfaslHesab" VALUES(120,1,'610201','تعدیلات سنواتی سود و زیان','معین',43,1,'مشترک');
INSERT INTO "SarfaslHesab" VALUES(121,1,'710101','اسناد وثیقه‌ای و ضمانتی دریافتی','معین',44,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(122,1,'710102','طرف حساب اسناد انتظامی دریافتی','معین',44,1,'بستانکار');
INSERT INTO "SarfaslHesab" VALUES(123,1,'710201','اسناد وثیقه‌ای و ضمانتی پرداختی','معین',45,1,'بدهکار');
INSERT INTO "SarfaslHesab" VALUES(124,1,'710202','طرف حساب اسناد انتظامی پرداختی','معین',45,1,'بستانکار');
CREATE TABLE "SarfaslShenavar" (
	"ShenavarID" INTEGER NOT NULL, 
	"CompanyID" INTEGER NOT NULL, 
	"AccountCode" VARCHAR(50) NOT NULL, 
	"AccountName" VARCHAR(200) NOT NULL, 
	"ParentShenavarID" INTEGER, 
	"IsActive" BOOLEAN, 
	PRIMARY KEY ("ShenavarID")
);
CREATE TABLE "Users" (
	"UserID" INTEGER NOT NULL, 
	"Username" VARCHAR(100) NOT NULL, 
	"Password" VARCHAR(255) NOT NULL, 
	"UserType" VARCHAR(50) NOT NULL, 
	"CreatedBy" INTEGER, 
	"CreatedDate" DATETIME, 
	"IsActive" BOOLEAN, 
	"FullName" VARCHAR(150), 
	"CreatorIP" VARCHAR(50), 
	"MaxCompaniesAllowed" INTEGER, 
	"MaxFiscalYearsPerCompany" INTEGER, 
	PRIMARY KEY ("UserID"), 
	UNIQUE ("Username")
);
INSERT INTO "Users" VALUES(1,'admin','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9','SuperAdmin',NULL,'2026-08-17 21:04:05.523723',1,'مدیر کل سیستم',NULL,99,99);
CREATE TABLE "Warehouses" (
	"WarehouseID" INTEGER NOT NULL, 
	"CompanyID" INTEGER, 
	"WarehouseName" VARCHAR(150) NOT NULL, 
	"Location" VARCHAR(250), 
	"IsActive" BOOLEAN, 
	"WarehouseType" VARCHAR(50), 
	"Phone" VARCHAR(50), 
	"WarehouseKeeper" VARCHAR(150), 
	"AllowNegativeStock" BOOLEAN, 
	"Description" TEXT, 
	PRIMARY KEY ("WarehouseID")
);
INSERT INTO "Warehouses" VALUES(1,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(2,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(3,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(4,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(5,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(6,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(7,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(8,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(9,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(10,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(11,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(12,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(13,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(14,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(15,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(16,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
INSERT INTO "Warehouses" VALUES(17,1,'انبار مرکزی','تهران - خیابان آزادی',1,'عمومی',NULL,NULL,0,NULL);
COMMIT;
