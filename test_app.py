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

    # 4. Test Product & Warehouse
    print("\n4. تست تعریف انبار و کالا...")
    wh_res = client.post("/api/Inventory/warehouses", json={
        "CompanyID": 1,
        "WarehouseName": "انبار مرکزی",
        "Location": "تهران - خیابان آزادی",
    })
    assert wh_res.status_code == 200
    saved_wh = wh_res.json()
    print(" -> انبار تعریف شد:", saved_wh["WarehouseName"])

    prod_res = client.post("/api/Inventory/products", json={
        "CompanyID": 1,
        "ProductCode": "PRD-001",
        "ProductName": "لپ‌تاپ گیمینگ ایسوس",
        "Unit": "دستگاه",
        "DefaultPrice": 75000000.0,
        "PurchasePrice": 65000000.0,
    })
    assert prod_res.status_code == 200
    saved_prod = prod_res.json()
    print(" -> کالا تعریف شد:", saved_prod["ProductName"])

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

    # Online rate fetch (3 Sources)
    online_rate_res = client.get("/api/Currencies/online-rate/USD")
    assert online_rate_res.status_code == 200
    rate_info = online_rate_res.json()
    assert "cbiRate" in rate_info
    assert "tgjuRate" in rate_info
    assert "globalRate" in rate_info
    print(f" -> استخراج آنلاین ۳ منبع نرخ دلار:")
    print(f"    🏦 ۱. بانک مرکزی (سنا): {rate_info['cbiRate']}")
    print(f"    📈 ۲. شبکه طلا و ارز (TGJU): {rate_info['tgjuRate']}")
    print(f"    🌍 ۳. سرویس بین‌المللی (Forex): {rate_info['globalRate']}")
    print(f"    📅 تاریخ استخراج: {rate_info['todayDate']}")

    print("\n✅ تمام تست‌ها با موفقیت ۱۰۰٪ پاس شدند!")

if __name__ == "__main__":
    run_tests()
