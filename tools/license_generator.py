#!/usr/bin/env python
"""
ابزار اختصاصی صدور لایسنس سامانه نگار تحت وب (Negar Web License Generator)
مخصوص مالک/توسعه‌دهنده نرم‌افزار برای صدور کلیدهای فعال‌سازی مشتریان ابری و اختصاصی.
"""
import sys
import os
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.services.license_service import create_license_token, ALL_SYSTEM_MODULES, get_machine_fingerprint


def main():
    print("=" * 65)
    print("    🔐 سیستم صدور لایسنس اختصاصی سامانه نگار تحت وب")
    print("=" * 65)

    current_fp = get_machine_fingerprint()
    print(f"[*] شناسه سخت‌افزاری این سیستم: {current_fp}
")

    customer_name = input("۱. نام مشتری / سازمان (مثال: شرکت پتروشیمی پارس): ").strip()
    if not customer_name:
        customer_name = "شرکت مشتری نگار"

    print("
۲. نوع استقرار نرم‌افزار:")
    print("   [1] سرور اختصاصی سازمان (On-Premise - قفل به سخت‌افزار سرور)")
    print("   [2] سرویس ابری متمرکز (Cloud SaaS - اشتراک اینترنتی)")
    print("   [3] نسخه آزمایشی (Trial)")
    deploy_choice = input("   انتخاب (پیش‌فرض: 1): ").strip()
    if deploy_choice == "2":
        lic_type = "CloudSaaS"
    elif deploy_choice == "3":
        lic_type = "Trial"
    else:
        lic_type = "OnPremise"

    if lic_type == "OnPremise":
        fingerprint = input(f"
۳. شناسه سخت‌افزاری سرور مشتری (کپی شده از سیستم مشتری، یا * برای بدون قفل سخت‌افزاری) [{current_fp}]: ").strip()
        if not fingerprint:
            fingerprint = current_fp
    else:
        fingerprint = "*"

    users_str = input("
۴. حداکثر تعداد کاربران مجاز (پیش‌فرض: 10): ").strip()
    max_users = int(users_str) if users_str.isdigit() else 10

    companies_str = input("۵. حداکثر تعداد شرکت‌های مجاز (پیش‌فرض: 3): ").strip()
    max_companies = int(companies_str) if companies_str.isdigit() else 3

    expiry_date = input("۶. تاریخ انقضا / تمدید سالانه (YYYY-MM-DD) [2028-12-31]: ").strip()
    if not expiry_date:
        expiry_date = "2028-12-31"

    token = create_license_token(
        customer_name=customer_name,
        license_type=lic_type,
        max_users=max_users,
        max_companies=max_companies,
        enabled_modules=ALL_SYSTEM_MODULES.copy(),
        expiry_date=expiry_date,
        machine_fingerprint=fingerprint,
        notes=f"لایسنس رسمی صادر شده برای {customer_name}"
    )

    print("
" + "=" * 65)
    print("✅ کلید فعال‌سازی (License Token) با موفقیت صادر شد:")
    print("=" * 65)
    print(token)
    print("=" * 65)
    print("[💡] این متن را به مشتری تحویل دهید تا در فرم «مدیریت لایسنس» نرم‌افزار وارد نماید.")


if __name__ == "__main__":
    main()
