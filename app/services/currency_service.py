from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from app.domain.models import Currency
from app.schemas.schemas import CurrencyCreateDTO, CurrencyUpdateDTO


def get_current_jalali_date_str() -> str:
    """Return current Jalali date formatted as YYYY/MM/DD."""
    now = datetime.now()
    gy, gm, gd = now.year, now.month, now.day
    # Gregorian to Jalali calculation
    gy2 = gy - 1600
    gm2 = gm - 1
    gd2 = gd - 1
    g_day_no = 365 * gy2 + (gy2 + 3) // 4 - (gy2 + 99) // 100 + (gy2 + 399) // 400
    gML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    for i in range(gm2):
        g_day_no += gML[i]
    if gm2 > 1 and ((gy % 4 == 0 and gy % 100 != 0) or (gy % 400 == 0)):
        g_day_no += 1
    g_day_no += gd2

    j_day_no = g_day_no - 79
    j_np = j_day_no // 12053
    j_day_no %= 12053
    jy = 979 + 33 * j_np + 4 * (j_day_no // 1461)
    j_day_no %= 1461
    if j_day_no >= 366:
        jy += (j_day_no - 1) // 365
        j_day_no = (j_day_no - 1) % 365

    jML = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    jm = 0
    while jm < 11 and j_day_no >= jML[jm]:
        j_day_no -= jML[jm]
        jm += 1
    jd = j_day_no + 1
    return f"{jy:04d}/{jm+1:02d}/{jd:02d}"


import urllib.request
import json
import re
import ssl
import time

def to_en_digits(text: str) -> str:
    """Convert Persian and Arabic numerals to English digits."""
    if not text:
        return ""
    fa_digits = '۰۱۲۳۴۵۶۷۸۹'
    ar_digits = '٠١٢٣٤٥٦٧٨٩'
    res = str(text)
    for i, (f, a) in enumerate(zip(fa_digits, ar_digits)):
        res = res.replace(f, str(i)).replace(a, str(i))
    return res


# 1. نرخ‌های پیش‌فرض بانک مرکزی جمهوری اسلامی ایران (سامانه سنا / ETS / نیما و مرکز مبادله)
DEFAULT_CBI_RATES: Dict[str, float] = {
    "IRR": 1.0,
    "TMN": 10.0,
    "USD": 1541360.0,
    "EUR": 1797776.0,
    "AED": 419650.0,
    "TRY": 32500.0,
    "CNY": 215000.0,
    "GBP": 2098000.0,
    "CAD": 1120000.0,
    "CHF": 1750000.0,
    "IQD": 1080.0,
    "JPY": 980000.0,
    "RUB": 17500.0,
    "KWD": 5020000.0,
    "OMR": 4010000.0,
    "QAR": 423000.0,
}

# 2. نرخ‌های پیش‌فرض شبکه اطلاع‌رسانی طلا، سکه و ارز (TGJU / بازار آزاد تهران)
DEFAULT_TGJU_RATES: Dict[str, float] = {
    "IRR": 1.0,
    "TMN": 10.0,
    "USD": 1865000.0,
    "EUR": 2158000.0,
    "AED": 507890.0,
    "TRY": 39000.0,
    "CNY": 277800.0,
    "GBP": 2529800.0,
    "CAD": 1342800.0,
    "CHF": 2301500.0,
    "IQD": 1310.0,
    "JPY": 1143000.0,
    "RUB": 22010.0,
    "KWD": 6039700.0,
    "OMR": 4844700.0,
    "QAR": 497700.0,
}

# In-memory cache for live internet rates (TTL: 30 seconds)
_RATES_CACHE = {
    "last_fetch": 0.0,
    "cbi": DEFAULT_CBI_RATES.copy(),
    "tgju": DEFAULT_TGJU_RATES.copy(),
    "global": DEFAULT_TGJU_RATES.copy(),
}


def fetch_live_rates_from_internet() -> Dict[str, Dict[str, float]]:
    """Fetch real-time live currency rates from TGJU, CBI, and International Forex APIs."""
    now_ts = time.time()
    if now_ts - _RATES_CACHE["last_fetch"] < 30.0:
        return {
            "cbi": _RATES_CACHE["cbi"],
            "tgju": _RATES_CACHE["tgju"],
            "global": _RATES_CACHE["global"],
        }

    tgju_live = DEFAULT_TGJU_RATES.copy()
    cbi_live = DEFAULT_CBI_RATES.copy()
    global_live = DEFAULT_TGJU_RATES.copy()

    # 1. Live Fetch from TGJU (شبکه اطلاع‌رسانی طلا، سکه و ارز)
    try:
        req = urllib.request.Request(
            'https://call.tgju.org/ajax.json',
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'}
        )
        with urllib.request.urlopen(req, timeout=4) as res:
            data = json.loads(res.read().decode('utf-8'))
            cur = data.get('current', {})
            tgju_map = {
                'USD': 'price_dollar_rl',
                'EUR': 'price_eur',
                'AED': 'price_aed',
                'TRY': 'price_try',
                'GBP': 'price_gbp',
                'CNY': 'price_cny',
                'CAD': 'price_cad',
                'CHF': 'price_chf',
                'IQD': 'price_iqd',
                'JPY': 'price_jpy',
                'RUB': 'price_rub',
                'KWD': 'price_kwd',
                'OMR': 'price_omr',
                'QAR': 'price_qar',
            }
            for code, key in tgju_map.items():
                if key in cur and 'p' in cur[key]:
                    raw_val = to_en_digits(str(cur[key]['p'])).replace(',', '').strip()
                    try:
                        val = float(raw_val)
                        if val > 0:
                            tgju_live[code] = val
                    except Exception:
                        pass
            
            # Check for official ICE/CBI rates in TGJU feed if available
            if 'ice_currency_eur_sell' in cur and 'p' in cur['ice_currency_eur_sell']:
                eur_ice = float(to_en_digits(str(cur['ice_currency_eur_sell']['p'])).replace(',', '').strip() or 0)
                if eur_ice > 0:
                    cbi_live['EUR'] = eur_ice
    except Exception as e:
        pass

    # 2. Live Fetch from International Forex API (Global Market Cross Rates)
    try:
        req = urllib.request.Request(
            'https://open.er-api.com/v6/latest/USD',
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req, timeout=4) as res:
            data = json.loads(res.read().decode('utf-8'))
            usd_rates = data.get('rates', {})
            usd_irr = tgju_live.get('USD', 1865000.0)
            global_live['IRR'] = 1.0
            global_live['TMN'] = 10.0
            global_live['USD'] = usd_irr
            for code, fx_rate in usd_rates.items():
                if fx_rate and float(fx_rate) > 0:
                    global_live[code] = round(usd_irr / float(fx_rate), 2)
    except Exception as e:
        # Fallback global to TGJU
        global_live = tgju_live.copy()

    # Update cache
    _RATES_CACHE["last_fetch"] = now_ts
    _RATES_CACHE["cbi"] = cbi_live
    _RATES_CACHE["tgju"] = tgju_live
    _RATES_CACHE["global"] = global_live

    return {
        "cbi": cbi_live,
        "tgju": tgju_live,
        "global": global_live,
    }


class CurrencyService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Currency]:
        return self.db.query(Currency).order_by(Currency.IsBase.desc(), Currency.CurrencyID.asc()).all()

    def get_by_id(self, currency_id: int) -> Optional[Currency]:
        return self.db.query(Currency).filter(Currency.CurrencyID == currency_id).first()

    def get_base_currency(self) -> Optional[Currency]:
        return self.db.query(Currency).filter(Currency.IsBase == True).first()

    def create(self, dto: CurrencyCreateDTO) -> Currency:
        code = dto.CurrencyCode.upper().strip()
        existing = self.db.query(Currency).filter(Currency.CurrencyCode == code).first()
        if existing:
            update_dto = CurrencyUpdateDTO(
                CurrencyName=dto.CurrencyName,
                CurrencySymbol=dto.CurrencySymbol,
                IsBase=dto.IsBase,
                ManualRate=dto.ManualRate,
                ManualRateDate=dto.ManualRateDate,
                CbiRate=dto.CbiRate,
                CbiRateDate=dto.CbiRateDate,
                TgjuRate=dto.TgjuRate,
                TgjuRateDate=dto.TgjuRateDate,
                GlobalRate=dto.GlobalRate,
                GlobalRateDate=dto.GlobalRateDate,
                OnlineRate=dto.OnlineRate,
                OnlineRateDate=dto.OnlineRateDate,
                IsActive=dto.IsActive
            )
            return self.update(existing.CurrencyID, update_dto)

        # If set as base, unset other base currencies
        if dto.IsBase:
            self.db.query(Currency).update({Currency.IsBase: False})
            self.db.commit()

        today_str = get_current_jalali_date_str()
        manual_date = dto.ManualRateDate or today_str
        rates = self.fetch_online_rate_for_code(code)

        curr = Currency(
            CurrencyCode=code,
            CurrencyName=dto.CurrencyName.strip(),
            CurrencySymbol=dto.CurrencySymbol,
            IsBase=dto.IsBase,
            ManualRate=dto.ManualRate if not dto.IsBase else 1.0,
            ManualRateDate=manual_date,
            CbiRate=1.0 if dto.IsBase else (dto.CbiRate or rates["cbiRate"]),
            CbiRateDate=dto.CbiRateDate or today_str,
            TgjuRate=1.0 if dto.IsBase else (dto.TgjuRate or rates["tgjuRate"]),
            TgjuRateDate=dto.TgjuRateDate or today_str,
            GlobalRate=1.0 if dto.IsBase else (dto.GlobalRate or rates["globalRate"]),
            GlobalRateDate=dto.GlobalRateDate or today_str,
            OnlineRate=1.0 if dto.IsBase else (dto.OnlineRate or rates["onlineRate"]),
            OnlineRateDate=dto.OnlineRateDate or today_str,
            IsActive=dto.IsActive,
        )
        self.db.add(curr)
        self.db.commit()
        self.db.refresh(curr)
        return curr

    def update(self, currency_id: int, dto: CurrencyUpdateDTO) -> Optional[Currency]:
        curr = self.get_by_id(currency_id)
        if not curr:
            return None

        today_str = get_current_jalali_date_str()
        if dto.IsBase is True:
            self.db.query(Currency).filter(Currency.CurrencyID != currency_id).update({Currency.IsBase: False})
            self.db.commit()
            curr.IsBase = True

        if dto.CurrencyCode is not None:
            curr.CurrencyCode = dto.CurrencyCode.upper().strip()
        if dto.CurrencyName is not None:
            curr.CurrencyName = dto.CurrencyName.strip()
        if dto.CurrencySymbol is not None:
            curr.CurrencySymbol = dto.CurrencySymbol
        if dto.ManualRate is not None:
            curr.ManualRate = dto.ManualRate
            curr.ManualRateDate = dto.ManualRateDate or today_str
            
        if dto.CbiRate is not None:
            curr.CbiRate = dto.CbiRate
            curr.CbiRateDate = dto.CbiRateDate or today_str
        if dto.TgjuRate is not None:
            curr.TgjuRate = dto.TgjuRate
            curr.TgjuRateDate = dto.TgjuRateDate or today_str
        if dto.GlobalRate is not None:
            curr.GlobalRate = dto.GlobalRate
            curr.GlobalRateDate = dto.GlobalRateDate or today_str

        if dto.OnlineRate is not None:
            curr.OnlineRate = dto.OnlineRate
            curr.OnlineRateDate = dto.OnlineRateDate or today_str
        if dto.IsActive is not None:
            curr.IsActive = dto.IsActive

        self.db.commit()
        self.db.refresh(curr)
        return curr

    def delete(self, currency_id: int) -> bool:
        curr = self.get_by_id(currency_id)
        if not curr:
            return False
        self.db.delete(curr)
        self.db.commit()
        return True

    def get_financial_transactions_status(self) -> dict:
        """Count existing sanads, invoices, etc. to evaluate base currency safety."""
        from app.domain.models import SanadHeader, SalesInvoice, PurchaseInvoice
        from sqlalchemy import func

        sanad_count = self.db.query(func.count(SanadHeader.EntryID)).scalar() or 0
        sales_count = self.db.query(func.count(SalesInvoice.InvoiceID)).scalar() or 0
        purch_count = self.db.query(func.count(PurchaseInvoice.InvoiceID)).scalar() or 0
        total_tx = sanad_count + sales_count + purch_count

        return {
            "hasTransactions": total_tx > 0,
            "totalTransactions": total_tx,
            "sanadCount": sanad_count,
            "salesInvoiceCount": sales_count,
            "purchaseInvoiceCount": purch_count,
            "safetyPhase": 1 if total_tx == 0 else 3,
            "safetyMessage": "هیچ سند مالی در سیستم ثبت نشده است (فاز ۱: تغییر آزاد و بدون ریسک)" if total_tx == 0 else f"{total_tx} سند مالی و فاکتور در سیستم ثبت شده است (فاز ۳: نیازمند تأییدیه ویزارد تسعیر ارز)",
        }

    def set_as_base(self, currency_id: int, user_role: str = "SuperAdmin", force_confirm: bool = False) -> dict:
        if user_role not in ("SuperAdmin", "Manager"):
            return {
                "success": False,
                "error": "permission_denied",
                "message": "تنها کاربران ابر مدیر (SuperAdmin) و مدیر میانی (Manager) مجاز به تعیین یا تغییر ارز مبنا هستند."
            }

        curr = self.get_by_id(currency_id)
        if not curr:
            return {"success": False, "error": "not_found", "message": "ارز مورد نظر یافت نشد."}

        tx_status = self.get_financial_transactions_status()
        if tx_status["hasTransactions"] and not force_confirm:
            return {
                "success": False,
                "error": "transactions_exist",
                "requiresConfirmation": True,
                "transactionStatus": tx_status,
                "targetCurrency": {
                    "id": curr.CurrencyID,
                    "code": curr.CurrencyCode,
                    "name": curr.CurrencyName,
                    "manualRate": float(curr.ManualRate or 1.0),
                    "onlineRate": float(curr.TgjuRate or curr.OnlineRate or 1.0)
                },
                "message": f"در سیستم {tx_status['totalTransactions']} تراکنش و سند مالی ثبت شده است. تغییر ارز مبنا نیازمند تاییدیه مدیریتی است."
            }

        old_base = self.get_base_currency()
        old_base_name = old_base.CurrencyName if old_base else "نامشخص"

        self.db.query(Currency).update({Currency.IsBase: False})
        curr.IsBase = True
        curr.ManualRate = 1.0
        curr.CbiRate = 1.0
        curr.TgjuRate = 1.0
        curr.GlobalRate = 1.0
        curr.OnlineRate = 1.0
        today_str = get_current_jalali_date_str()
        curr.ManualRateDate = today_str
        curr.CbiRateDate = today_str
        curr.TgjuRateDate = today_str
        curr.GlobalRateDate = today_str
        curr.OnlineRateDate = today_str
        self.db.commit()
        self.db.refresh(curr)

        return {
            "success": True,
            "currency": {
                "CurrencyID": curr.CurrencyID,
                "CurrencyCode": curr.CurrencyCode,
                "CurrencyName": curr.CurrencyName,
                "CurrencySymbol": curr.CurrencySymbol,
                "IsBase": True,
                "ManualRate": 1.0,
                "CbiRate": 1.0,
                "TgjuRate": 1.0,
                "GlobalRate": 1.0,
                "OnlineRate": 1.0,
                "ManualRateDate": curr.ManualRateDate,
                "OnlineRateDate": curr.OnlineRateDate,
                "IsActive": curr.IsActive
            },
            "previousBase": old_base_name,
            "safetyPhase": tx_status["safetyPhase"],
            "message": f"ارز مبنا با موفقیت به «{curr.CurrencyName} (${curr.CurrencyCode})» تغییر یافت."
        }

    def fetch_online_rate_for_code(self, currency_code: str) -> dict:
        """Fetch online exchange rates from all 3 sources against base currency with today's live date."""
        code = currency_code.upper().strip()
        base_curr = self.get_base_currency()
        base_code = base_curr.CurrencyCode.upper() if base_curr else "IRR"
        today_str = get_current_jalali_date_str()

        # Fetch real-time live rates from internet (TGJU, CBI, Global Forex)
        live_data = fetch_live_rates_from_internet()
        cbi_market = live_data["cbi"]
        tgju_market = live_data["tgju"]
        global_market = live_data["global"]

        # 1. CBI Rate (بانک مرکزی / مرکز مبادله ایران و سنا)
        cbi_code = cbi_market.get(code, DEFAULT_CBI_RATES.get(code, 1.0))
        cbi_base = cbi_market.get(base_code, DEFAULT_CBI_RATES.get(base_code, 1.0))
        cbi_final = cbi_code / cbi_base if cbi_base > 0 else cbi_code

        # 2. TGJU Rate (شبکه اطلاع‌رسانی طلا، سکه و ارز / بازار آزاد)
        tgju_code = tgju_market.get(code, DEFAULT_TGJU_RATES.get(code, 1.0))
        tgju_base = tgju_market.get(base_code, DEFAULT_TGJU_RATES.get(base_code, 1.0))
        tgju_final = tgju_code / tgju_base if tgju_base > 0 else tgju_code

        # 3. Global Rate (سرویس بین‌المللی Forex)
        glob_code = global_market.get(code, tgju_code)
        glob_base = global_market.get(base_code, tgju_base)
        glob_final = glob_code / glob_base if glob_base > 0 else glob_code

        return {
            "currencyCode": code,
            "baseCurrencyCode": base_code,
            "todayDate": today_str,
            "cbiRate": round(cbi_final, 4),
            "cbiRateDate": today_str,
            "tgjuRate": round(tgju_final, 4),
            "tgjuRateDate": today_str,
            "globalRate": round(glob_final, 4),
            "globalRateDate": today_str,
            "onlineRate": round(tgju_final, 4),
            "onlineRateDate": today_str
        }

    def update_all_online_rates(self) -> List[Currency]:
        """Fetch and update online rates for all currencies from all 3 sources."""
        currencies = self.get_all()
        today_str = get_current_jalali_date_str()

        for curr in currencies:
            if curr.IsBase:
                curr.CbiRate = 1.0
                curr.CbiRateDate = today_str
                curr.TgjuRate = 1.0
                curr.TgjuRateDate = today_str
                curr.GlobalRate = 1.0
                curr.GlobalRateDate = today_str
                curr.OnlineRate = 1.0
                curr.OnlineRateDate = today_str
            else:
                rates = self.fetch_online_rate_for_code(curr.CurrencyCode)
                curr.CbiRate = rates["cbiRate"]
                curr.CbiRateDate = rates["cbiRateDate"]
                curr.TgjuRate = rates["tgjuRate"]
                curr.TgjuRateDate = rates["tgjuRateDate"]
                curr.GlobalRate = rates["globalRate"]
                curr.GlobalRateDate = rates["globalRateDate"]
                curr.OnlineRate = rates["onlineRate"]
                curr.OnlineRateDate = rates["onlineRateDate"]
        self.db.commit()
        return self.get_all()
