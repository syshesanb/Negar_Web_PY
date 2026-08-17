# Negar Web Application (نرم‌افزار جامع نگار تحت وب - نسخه پایتون)

یک سیستم کامل، منسجم و مدرن بر پایه **Python (FastAPI + SQLAlchemy)** با پشتیبانی از دیتابیس **PostgreSQL** و **SQLite** برای مدیریت مالی، حسابداری، انبارداری، خرید و فروش، و دسترسی‌های کاربران همراه با فرانت‌اند وب راست‌چین و مدرن و پشتیبانی از برنامه‌های موبایل (PWA/API).

---

## 🚀 ویژگی‌های کلیدی
- **بک‌اند مدرن و پرسرعت FastAPI**: پشتیبانی کامل Asynchronous با ساختار تمیز لایه‌ای (Domain, Infrastructure, Application Services, API)
- **مستندات تعاملی Swagger / OpenAPI**: در دسترس در آدرس‌های `/docs` و `/swagger`
- **پشتیبانی از پایگاه داده دوگانه**:
  - آماده‌سازی با **PostgreSQL** و اسکریپت `Database/postgres_schema.sql`
  - حالت پیش‌فرض با **SQLite** جهت تست و اجرای آنی بدون نیاز به نصب دیتابیس جداگانه
- **کدگذاری حساب‌ها (درختی)**: گروه، کل، معین و تفصیلی همراه با حساب‌های شناور
- **ثبت و صدور اسناد حسابداری (سند ۱ و ۲)**: کنترل توازن خودکار بدهکار/بستانکار و تاییدیه اسناد
- **انبارداری و کالاها**: تعریف گروه کالا، کالاها، انبارها و موجودی انبار همراه با میانگین بهای تمام شده
- **فاکتورهای خرید و فروش**: ثبت فاکتورها، بروزرسانی انبار و صدور سند اتوماتیک
- **کاربران و سطوح دسترسی**: ماتریس کامل دسترسی‌ها (مشاهده، ایجاد، ویرایش، حذف، چاپ، خروجی)
- **مدیریت شرکت‌ها و سال‌های مالی**
- **فرانت‌اند مدرن، واکنش‌گرا و قابل نصب (PWA)**: با تم‌های رنگی و تقویم فارسی اختصاصی

---

## 📁 ساختار پروژه

```
C:\Negar_Web_PY\
│
├── app\
│   ├── config.py                 # تنظیمات، خواندن متغیرهای محیطی و مسیرها
│   ├── domain\                   # مدل‌ها و انتیتی‌های دیتابیس (SQLAlchemy Models)
│   ├── schemas\                  # اسکیمای اعتبارسنجی داده‌ها (Pydantic Schemas / DTOs)
│   ├── infrastructure\           # ارتباط با دیتابیس، سشن و امنیت (SHA256 & JWT)
│   ├── services\                 # لایه سرویس‌های منطق بیزینس (Auth, Accounting, Inventory, Dashboard)
│   ├── api\                      # کنترلرها و روترهای REST API
│   └── static\                   # فرانت‌اند وبی کامل (HTML, CSS, JS, PWA, تقویم شمسی)
│
├── Database\
│   └── postgres_schema.sql       # اسکریپت ساخت جداول و داده‌های اولیه در PostgreSQL
│
├── main.py                       # فایل اصلی اجرای سرور وب
├── requirements.txt              # لیست پکیج‌های پایتون
├── .env.example                  # نمونه تنظیمات محیطی
└── README.md                     # راهنمای سیستم
```

---

## 🛠️ راه‌اندازی و اجرا

### ۱. نصب وابستگی‌های پایتون
```bash
pip install -r requirements.txt
```

### ۲. اجرای سرور
```bash
python main.py
```
یا با استفاده از Uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

### ۳. مشاهده سامانه
- **رابط کاربری وب**: [http://localhost:8000](http://localhost:8000)
- **مستندات Swagger API**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 👤 اطلاعات ورود پیش‌فرض
- **نام کاربری**: `admin`
- **رمز عبور**: `admin123`

---

## 🗄️ اتصال به PostgreSQL (اختیاری)
برای اتصال به پایگاه داده PostgreSQL، در فایل `.env` تنظیمات زیر را قرار دهید:
```env
DB_TYPE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=negar_db
```
و اسکریپت `Database/postgres_schema.sql` را در سرور PostgreSQL خود اجرا فرمایید.
