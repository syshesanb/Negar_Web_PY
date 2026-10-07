import sys
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass
from fastapi.testclient import TestClient
from main import app
from app.infrastructure.database import init_db

# Initialize database
init_db()

client = TestClient(app)

def run_tests():
    print("=== شروع تست‌های اعتبارسنجی سامانه نگار پایتون ===")

    # 1. Test Login
    print("\n1. تست احراز هویت (Login)...")
    res = client.post("/api/Auth/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    assert data["success"] is True
    assert data["username"] == "admin"
    print(" -> لاگین موفقیت‌آمیز بود. توکن دریافت شد:", data["token"])

    # 2. Test Account Creation & Listing
    print("\n2. تست ایجاد و دریافت سرفصل‌های حسابداری...")
    account_payload = {
        "CompanyID": 1,
        "AccountCode": "10101",
        "AccountName": "صندوق مرکزی",
        "AccountType": "معین",
        "IsActive": True,
        "AccountNature": "بدهکار",
    }
    res = client.post("/api/Accounting/accounts", json=account_payload)
    assert res.status_code == 200, f"Save account failed: {res.text}"
    saved_acc = res.json()
    print(" -> سرفصل ذخیره شد:", saved_acc["AccountName"], "(کد:", saved_acc["AccountCode"], ")")

    res = client.get("/api/Accounting/accounts/1")
    assert res.status_code == 200
    accounts = res.json()
    assert len(accounts) >= 1
    print(f" -> تعداد سرفصل‌های دریافت شده برای شرکت 1: {len(accounts)}")

    # 3. Test Sanad (Journal Entry) Creation & Balance Check
    print("\n3. تست ثبت سند حسابداری و محاسبه توازن...")
    sanad_payload = {
        "CompanyID": 1,
        "FiscalYearID": 1,
        "Description": "سند افتتاحیه آزمایشی",
        "SharhSanad": "ثبت اولیه سرمایه و موجودی نقد",
        "Details": [
            {
                "AccountID": saved_acc["AccountID"],
                "DebitAmount": 5000000.0,
                "CreditAmount": 0.0,
                "LineNumber": 1,
                "SharhRadif": "موجودی صندوق",
            },
            {
                "AccountID": saved_acc["AccountID"],
                "DebitAmount": 0.0,
                "CreditAmount": 5000000.0,
                "LineNumber": 2,
                "SharhRadif": "طرف حساب سرمایه",
            }
        ]
    }
    res = client.post("/api/Accounting/sanad", json=sanad_payload)
    assert res.status_code == 200, f"Save sanad failed: {res.text}"
    saved_sanad = res.json()
    assert saved_sanad["TaeazSanad"] == "متوازن"
    assert saved_sanad["JamBedehkar"] == 5000000.0
    assert saved_sanad["JamBestankar"] == 5000000.0
    print(f" -> سند شماره {saved_sanad['EntryID']} با وضعیت [{saved_sanad['TaeazSanad']}] ثبت شد.")

    # 4. Test Product Group, Product & Warehouse
    print("\n4. تست تعریف گروه‌بندی کالا، انبار و کالا...")
    pg_res = client.post("/api/Inventory/product-groups", json={
        "CompanyID": 1,
        "GroupCode": "GRP-01",
        "GroupName": "لوازم جانبی کامپیوتر"
    })
    assert pg_res.status_code == 200, f"Save product group failed: {pg_res.text}"
    saved_pg = pg_res.json()
    print(" -> گروه کالا تعریف شد:", saved_pg["GroupName"])

    pg_list_res = client.get("/api/Inventory/product-groups?companyId=1")
    assert pg_list_res.status_code == 200
    assert len(pg_list_res.json()) >= 1

    # Product Unit Tests (Root & Child)
    pu_parent_res = client.post("/api/Inventory/product-units", json={
        "CompanyID": 1,
        "UnitCode": "UNT-01",
        "UnitName": "وزن",
        "Symbol": "W",
        "ConversionRatio": 1.0
    })
    assert pu_parent_res.status_code == 200, f"Save parent unit failed: {pu_parent_res.text}"
    saved_pu_parent = pu_parent_res.json()
    print(" -> واحد اصلی تعریف شد:", saved_pu_parent["UnitName"])

    pu_child_res = client.post("/api/Inventory/product-units", json={
        "CompanyID": 1,
        "ParentID": saved_pu_parent["UnitID"],
        "UnitCode": "UNT-01-01",
        "UnitName": "کیلوگرم",
        "Symbol": "kg",
        "ConversionRatio": 1.0,
        "RatioType": "ثابت"
    })
    assert pu_child_res.status_code == 200, f"Save child unit failed: {pu_child_res.text}"
    saved_pu_child = pu_child_res.json()
    assert saved_pu_child["ParentName"] == "وزن"
    print(" -> واحد فرزند تعریف شد:", saved_pu_child["UnitName"], "با والد:", saved_pu_child["ParentName"])

    pu_float_res = client.post("/api/Inventory/product-units", json={
        "CompanyID": 1,
        "ParentID": saved_pu_child["UnitID"],
        "UnitCode": "UNT-01-02",
        "UnitName": "گونی برنج",
        "Symbol": "گونی",
        "ConversionRatio": 20.0,
        "RatioType": "شناور",
        "IsFloating": True
    })
    assert pu_float_res.status_code == 200, f"Save floating unit failed: {pu_float_res.text}"
    saved_pu_float = pu_float_res.json()
    assert saved_pu_float["RatioType"] == "شناور"
    print(" -> واحد شناور (متغیر) تعریف شد:", saved_pu_float["UnitName"], f"[{saved_pu_float['RatioType']}]")

    wh_res = client.post("/api/Inventory/warehouses", json={
        "CompanyID": 1,
        "WarehouseName": "انبار مرکزی",
        "Location": "تهران - خیابان آزادی",
    })
    assert wh_res.status_code == 200
    saved_wh = wh_res.json()
    print(" -> انبار تعریف شد:", saved_wh["WarehouseName"])

    loc_res = client.post("/api/Inventory/warehouses/locations", json={
        "WarehouseID": saved_wh["WarehouseID"],
        "LocationCode": "WH01-ZA-A01-R05-L02-B01",
        "Zone": "زون A",
        "Aisle": "01",
        "Rack": "05",
        "Shelf": "02",
        "Bin": "01"
    })
    assert loc_res.status_code == 200
    saved_loc = loc_res.json()
    print(" -> جایگاه فیزیکی انبار تعریف شد:", saved_loc["LocationCode"])

    # Test GET locations
    get_locs = client.get(f"/api/Inventory/warehouses/{saved_wh['WarehouseID']}/locations")
    assert get_locs.status_code == 200
    assert len(get_locs.json()) >= 1

    # Test GET all locations
    get_all_locs = client.get("/api/Inventory/warehouses/locations")
    assert get_all_locs.status_code == 200
    assert len(get_all_locs.json()) >= 1



    prod_res = client.post("/api/Inventory/products", json={
        "CompanyID": 1,
        "ProductCode": "PRD-001",
        "ProductName": "لپ‌تاپ گیمینگ ایسوس",
        "Unit": "دستگاه",
        "DefaultLocationCode": saved_loc["LocationCode"],
        "DefaultPrice": 75000000.0,
        "PurchasePrice": 65000000.0,
    })
    assert prod_res.status_code == 200
    saved_prod = prod_res.json()
    print(" -> کالا تعریف شد:", saved_prod["ProductName"])

    # Test safety guard: deleting all locations when location is assigned should fail (400 Bad Request)
    del_all_fail = client.delete(f"/api/Inventory/warehouses/{saved_wh['WarehouseID']}/locations")
    assert del_all_fail.status_code == 400, f"Expected 400 when deleting assigned locations, got: {del_all_fail.status_code}"
    print(" -> تست ایمنی حذف تمامی جایگاه‌ها با موفقیت تأیید شد (توقیف حذف با پیام مناسب).")

    # Test safety guard: deleting single assigned location should fail (400 Bad Request)
    del_single_fail = client.delete(f"/api/Inventory/warehouses/locations/{saved_loc['LocationID']}")
    assert del_single_fail.status_code == 400, f"Expected 400 when deleting single assigned location, got: {del_single_fail.status_code}"
    print(" -> تست ایمنی حذف تک جایگاه اختصاص‌یافته با موفقیت تأیید شد.")

    # 5. Test Dashboard Summary
    print("\n5. تست خلاصه داشبورد...")
    dash_res = client.get("/api/Dashboard/summary")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    print(" -> خلاصه داشبورد:", dash_data)

    # 6. Test Theme Persistence & Server Injection
    print("\n6. تست ذخیره و اعمال تم در سرور...")
    theme_res = client.post("/api/Dashboard/theme", json={"theme": "light"})
    assert theme_res.status_code == 200
    assert theme_res.json()["theme"] == "light"
    print(" -> تم روشن در سرور ذخیره شد.")

    get_theme_res = client.get("/api/Dashboard/theme")
    assert get_theme_res.status_code == 200
    assert get_theme_res.json()["theme"] == "light"
    print(" -> استعلام تم فعال از سرور: light")

    # 8. Test Currency Management API & Online Rates
    print("\n8. تست ماژول مدیریت ارزها و نرخ‌های برابری...")
    curr_list_res = client.get("/api/Currencies")
    assert curr_list_res.status_code == 200
    currs = curr_list_res.json()
    assert len(currs) >= 1
    print(f" -> تعداد ارزهای موجود در سیستم: {len(currs)}")

    # Create new currency
    new_curr_res = client.post("/api/Currencies", json={
        "CurrencyCode": "CAD",
        "CurrencyName": "دلار کانادا",
        "CurrencySymbol": "C$",
        "IsBase": False,
        "ManualRate": 450000.0,
        "ManualRateDate": "1405/05/27",
        "OnlineRate": 452000.0,
        "OnlineRateDate": "1405/05/27",
        "IsActive": True
    })
    assert new_curr_res.status_code == 200
    saved_curr = new_curr_res.json()
    assert saved_curr["CurrencyCode"] == "CAD"
    print(" -> ارز جدید ایجاد شد:", saved_curr["CurrencyName"])

    # 9. تست ماژول لایسنسینگ و معماری دوگانه استقرار
    print("\n9. تست ماژول لایسنسینگ و معماری دوگانه استقرار...")
    from app.services.license_service import create_license_token, get_machine_fingerprint
    
    server_fp = get_machine_fingerprint()
    assert server_fp.startswith("NGR-")
    print(f" -> شناسه سخت‌افزاری سرور: {server_fp}")

    # Test license status endpoint
    lic_stat_res = client.get("/api/License/status")
    assert lic_stat_res.status_code == 200
    lic_status = lic_stat_res.json()
    assert "deploymentMode" in lic_status
    assert "enabledModules" in lic_status
    print(f" -> وضعیت استقرار سامانه: {lic_status['modeTitle']}")
    print(f" -> وضعیت اعتبار لایسنس: {lic_status['statusTitle']}")

    # Test token creation and activation
    test_token = create_license_token(
        customer_name="شرکت آزمایشی نگار",
        license_type="OnPremise",
        max_users=25,
        max_companies=5,
        expiry_date="2032-12-31",
        machine_fingerprint=server_fp
    )
    act_res = client.post("/api/License/activate", json={"token": test_token})
    assert act_res.status_code == 200
    act_data = act_res.json()
    assert act_data["success"] is True
    print(f" -> لایسنس آزمایشی با موفقیت فعال شد: {act_data['customer']} (کاربران: {act_data['maxUsers']})")

    print("\n✅ تمام تست‌ها با موفقیت ۱۰۰٪ پاس شدند!")

if __name__ == "__main__":
    run_tests()
