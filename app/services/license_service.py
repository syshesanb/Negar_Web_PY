import os
import sys
import json
import time
import base64
import hmac
import hashlib
import platform
import subprocess
from datetime import datetime, date
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.config import settings

ALL_SYSTEM_MODULES = [
    "accounting",     # ماژول حسابداری مالی
    "inventory",      # ماژول انبارداری و کالا
    "sales",          # ماژول خرید و فروش و فاکتور
    "treasury",       # ماژول خزانه و چک و بانک
    "payroll",        # ماژول حقوق و دستمزد
    "currencies",     # ماژول ارزی و برابری ارزها
    "modyan",         # ماژول اتصال به سامانه مودیان مالیاتی
    "users",          # ماژول مدیریت کاربران و دسترسی‌ها
]


def get_machine_fingerprint() -> str:
    """Generate a deterministic, unique hardware fingerprint for the host server."""
    raw_identifiers = []
    
    # 1. Platform basic info
    raw_identifiers.append(platform.node())
    raw_identifiers.append(platform.machine())
    raw_identifiers.append(platform.processor())

    # 2. Windows specific hardware UUID / Motherboard Serial
    if sys.platform == "win32":
        try:
            out = subprocess.check_output("wmic csproduct get uuid", shell=True, stderr=subprocess.DEVNULL).decode()
            lines = [line.strip() for line in out.splitlines() if line.strip() and "UUID" not in line.upper()]
            if lines:
                raw_identifiers.append(lines[0])
        except Exception:
            pass

        try:
            out = subprocess.check_output("wmic baseboard get serialnumber", shell=True, stderr=subprocess.DEVNULL).decode()
            lines = [line.strip() for line in out.splitlines() if line.strip() and "SERIALNUMBER" not in line.upper()]
            if lines:
                raw_identifiers.append(lines[0])
        except Exception:
            pass
    elif sys.platform.startswith("linux"):
        try:
            for p in ["/sys/class/dmi/id/product_uuid", "/etc/machine-id", "/var/lib/dbus/machine-id"]:
                if os.path.exists(p):
                    with open(p, "r") as f:
                        raw_identifiers.append(f.read().strip())
                    break
        except Exception:
            pass

    # 3. Fallback to MAC address
    import uuid
    raw_identifiers.append(str(uuid.getnode()))

    combined = "@@".join(raw_identifiers)
    digest = hashlib.sha256(combined.encode("utf-8")).hexdigest().upper()
    return f"NGR-{digest[0:4]}-{digest[4:8]}-{digest[8:12]}-{digest[12:16]}"


def compute_signature(payload_json: str) -> str:
    """Compute HMAC-SHA256 signature for a given JSON string using the master license secret."""
    key = settings.LICENSE_SECRET_KEY.encode("utf-8")
    sig = hmac.new(key, payload_json.encode("utf-8"), hashlib.sha256).hexdigest()
    return sig


def create_license_token(
    customer_name: str,
    license_type: str = "OnPremise",  # "OnPremise", "CloudSaaS", "Trial"
    max_users: int = 10,
    max_companies: int = 3,
    enabled_modules: Optional[List[str]] = None,
    expiry_date: str = "2028-12-31",
    machine_fingerprint: str = "*",
    notes: str = ""
) -> str:
    """Generate a tamper-proof cryptographically signed license token."""
    if enabled_modules is None:
        enabled_modules = ALL_SYSTEM_MODULES.copy()

    payload = {
        "customer": customer_name,
        "type": license_type,
        "maxUsers": max_users,
        "maxCompanies": max_companies,
        "modules": enabled_modules,
        "issuedAt": date.today().isoformat(),
        "expiresAt": expiry_date,
        "fingerprint": machine_fingerprint,
        "notes": notes,
        "ver": "2.0"
    }

    payload_json = json.dumps(payload, sort_keys=True)
    signature = compute_signature(payload_json)
    
    full_data = {
        "p": payload,
        "s": signature
    }
    
    token = base64.urlsafe_b64encode(json.dumps(full_data).encode("utf-8")).decode("utf-8")
    return token


class LicenseService:
    def __init__(self):
        self.license_path = settings.LICENSE_FILE_PATH
        self.current_fingerprint = get_machine_fingerprint()

    def get_raw_token_from_disk(self) -> Optional[str]:
        """Read license token from disk file if present."""
        if self.license_path.exists():
            try:
                with open(self.license_path, "r", encoding="utf-8") as f:
                    token = f.read().strip()
                    if token:
                        return token
            except Exception:
                pass
        return None

    def save_token_to_disk(self, token: str) -> bool:
        """Save license token to local disk."""
        try:
            with open(self.license_path, "w", encoding="utf-8") as f:
                f.write(token.strip())
            return True
        except Exception:
            return False

    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify token integrity, signature, hardware binding, and expiry."""
        try:
            raw_json = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
            full_data = json.loads(raw_json)
            payload = full_data.get("p", {})
            signature = full_data.get("s", "")

            # 1. Verify HMAC Signature
            expected_sig = compute_signature(json.dumps(payload, sort_keys=True))
            if not hmac.compare_digest(signature, expected_sig):
                return {"valid": False, "reason": "امضای دیجیتال لایسنس نامعتبر است یا فایل دستکاری شده است."}

            # 2. Verify Expiry Date
            exp_str = payload.get("expiresAt", "2099-12-31")
            exp_date = datetime.strptime(exp_str, "%Y-%m-%d").date()
            today = date.today()
            if today > exp_date:
                return {
                    "valid": False,
                    "reason": f"اعتبار لایسنس در تاریخ {exp_str} به پایان رسیده است. لطفاً نسبت به تمدید لایسنس اقدام نمایید.",
                    "expired": True,
                    "payload": payload
                }

            # 3. Verify Hardware Binding in OnPremise Mode
            deploy_mode = settings.DEPLOYMENT_MODE
            lic_type = payload.get("type", "OnPremise")
            lic_fingerprint = payload.get("fingerprint", "*")

            if deploy_mode == "ON_PREMISE" and lic_fingerprint != "*":
                if lic_fingerprint.upper().strip() != self.current_fingerprint.upper().strip():
                    return {
                        "valid": False,
                        "reason": f"این لایسنس برای سرور دیگری صادر شده است. شناسه سخت‌افزاری این سرور ({self.current_fingerprint}) با شناسه لایسنس مطابقت ندارد.",
                        "fingerprintMismatch": True,
                        "payload": payload
                    }

            days_remaining = (exp_date - today).days

            return {
                "valid": True,
                "payload": payload,
                "daysRemaining": days_remaining,
                "expiresAt": exp_str,
                "reason": "لایسنس معتبر و فعال است."
            }
        except Exception as e:
            return {"valid": False, "reason": f"فرمت لایسنس نامعتبر است: {str(e)}"}

    def get_default_fallback_license(self) -> Dict[str, Any]:
        """Provide a default built-in active license for smooth out-of-the-box development and demonstration."""
        return {
            "customer": "شرکت نمونه نگار (نسخه دائمی سازمانی)",
            "type": "OnPremise" if settings.DEPLOYMENT_MODE == "ON_PREMISE" else "CloudSaaS",
            "maxUsers": 99,
            "maxCompanies": 20,
            "modules": ALL_SYSTEM_MODULES.copy(),
            "issuedAt": "1403/01/01",
            "expiresAt": "2030-12-29",
            "fingerprint": "*",
            "notes": "نسخه پیش‌فرض سازمانی نگار تحت وب"
        }

    def get_status(self) -> Dict[str, Any]:
        """Return comprehensive status of deployment mode, license validity, limits, and server fingerprint."""
        token = self.get_raw_token_from_disk()
        mode = settings.DEPLOYMENT_MODE
        server_fp = self.current_fingerprint

        if token:
            ver = self.verify_token(token)
            if ver["valid"]:
                p = ver["payload"]
                return {
                    "deploymentMode": mode,
                    "modeTitle": "🏢 سرور اختصاصی سازمان (On-Premise)" if mode == "ON_PREMISE" else "☁️ سرویس ابری متمرکز (Cloud SaaS)",
                    "isValid": True,
                    "statusTitle": "🟢 فعال و دارای اعتبار قانونی",
                    "customerName": p.get("customer", "مشتری نگار"),
                    "licenseType": p.get("type", "OnPremise"),
                    "maxUsers": p.get("maxUsers", 99),
                    "maxCompanies": p.get("maxCompanies", 10),
                    "enabledModules": p.get("modules", ALL_SYSTEM_MODULES),
                    "expiresAt": ver["expiresAt"],
                    "daysRemaining": ver["daysRemaining"],
                    "issuedAt": p.get("issuedAt", ""),
                    "serverFingerprint": server_fp,
                    "isHardwareBound": (p.get("fingerprint", "*") != "*"),
                    "message": "لایسنس سامانه معتبر است."
                }
            else:
                p = ver.get("payload", self.get_default_fallback_license())
                return {
                    "deploymentMode": mode,
                    "modeTitle": "🏢 سرور اختصاصی سازمان (On-Premise)" if mode == "ON_PREMISE" else "☁️ سرویس ابری متمرکز (Cloud SaaS)",
                    "isValid": False,
                    "statusTitle": "🔴 لایسنس منقضی یا نامعتبر",
                    "customerName": p.get("customer", "مشتری نگار"),
                    "licenseType": p.get("type", "OnPremise"),
                    "maxUsers": p.get("maxUsers", 5),
                    "maxCompanies": p.get("maxCompanies", 1),
                    "enabledModules": p.get("modules", ["accounting"]),
                    "expiresAt": p.get("expiresAt", "منقضی شده"),
                    "daysRemaining": 0,
                    "issuedAt": p.get("issuedAt", ""),
                    "serverFingerprint": server_fp,
                    "isHardwareBound": False,
                    "message": ver["reason"]
                }
        else:
            fb = self.get_default_fallback_license()
            return {
                "deploymentMode": mode,
                "modeTitle": "🏢 سرور اختصاصی سازمان (On-Premise)" if mode == "ON_PREMISE" else "☁️ سرویس ابری متمرکز (Cloud SaaS)",
                "isValid": True,
                "statusTitle": "🟢 فعال (نسخه پیش‌فرض سازمانی)",
                "customerName": fb["customer"],
                "licenseType": fb["type"],
                "maxUsers": fb["maxUsers"],
                "maxCompanies": fb["maxCompanies"],
                "enabledModules": fb["modules"],
                "expiresAt": fb["expiresAt"],
                "daysRemaining": 1580,
                "issuedAt": fb["issuedAt"],
                "serverFingerprint": server_fp,
                "isHardwareBound": False,
                "message": "سامانه با مجوز سازمانی فعال است."
            }

    def activate(self, token: str) -> Dict[str, Any]:
        """Activate or update system license with a new token."""
        token_clean = token.strip()
        ver = self.verify_token(token_clean)
        if not ver["valid"]:
            return {
                "success": False,
                "message": ver["reason"]
            }
        
        saved = self.save_token_to_disk(token_clean)
        if not saved:
            return {
                "success": False,
                "message": "خطا در ذخیره فایل لایسنس روی دیسک سرور."
            }

        p = ver["payload"]
        return {
            "success": True,
            "message": f"لایسنس سامانه با موفقیت برای «{p.get('customer')}» فعال گردید.",
            "customer": p.get("customer"),
            "expiresAt": ver["expiresAt"],
            "daysRemaining": ver["daysRemaining"],
            "maxUsers": p.get("maxUsers"),
            "maxCompanies": p.get("maxCompanies")
        }
