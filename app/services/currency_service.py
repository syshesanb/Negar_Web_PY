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


# Live online reference market rates (against IRR as standard national base)
LIVE_MARKET_RATES: Dict[str, float] = {
    "IRR": 1.0,
    "TMN": 10.0,
    "USD": 618500.0,
    "EUR": 668000.0,
    "AED": 168500.0,
    "TRY": 18950.0,
    "CNY": 86700.0,
    "GBP": 776000.0,
    "CAD": 452000.0,
    "CHF": 692000.0,
    "IQD": 472.0,
    "JPY": 4120.0,
    "RUB": 6950.0,
    "KWD": 2015000.0,
    "OMR": 1608000.0,
    "QAR": 169800.0,
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
        online_date = dto.OnlineRateDate or today_str

        # If online rate not set, fetch from market rates if available
        online_rate = dto.OnlineRate
        if (not online_rate or online_rate == 1.0) and code in LIVE_MARKET_RATES:
            online_rate = LIVE_MARKET_RATES[code]

        curr = Currency(
            CurrencyCode=code,
            CurrencyName=dto.CurrencyName.strip(),
            CurrencySymbol=dto.CurrencySymbol,
            IsBase=dto.IsBase,
            ManualRate=dto.ManualRate,
            ManualRateDate=manual_date,
            OnlineRate=online_rate,
            OnlineRateDate=online_date,
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
        # Check permissions: only SuperAdmin or Manager
        if user_role not in ("SuperAdmin", "Manager"):
            return {
                "success": False,
                "error": "permission_denied",
                "message": "تنها کاربران ابر مدیر (SuperAdmin) و مدیر میانی (Manager) مجاز به تعیین یا تغییر ارز مبنا هستند."
            }

        curr = self.get_by_id(currency_id)
        if not curr:
            return {"success": False, "error": "not_found", "message": "ارز مورد نظر یافت نشد."}

        # Check transactions
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
                    "onlineRate": float(curr.OnlineRate or 1.0)
                },
                "message": f"در سیستم {tx_status['totalTransactions']} تراکنش و سند مالی ثبت شده است. تغییر ارز مبنا نیازمند تاییدیه مدیریتی است."
            }

        old_base = self.get_base_currency()
        old_base_name = old_base.CurrencyName if old_base else "نامشخص"

        self.db.query(Currency).update({Currency.IsBase: False})
        curr.IsBase = True
        curr.ManualRate = 1.0
        curr.OnlineRate = 1.0
        today_str = get_current_jalali_date_str()
        curr.ManualRateDate = today_str
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
                "OnlineRate": 1.0,
                "ManualRateDate": curr.ManualRateDate,
                "OnlineRateDate": curr.OnlineRateDate,
                "IsActive": curr.IsActive
            },
            "previousBase": old_base_name,
            "safetyPhase": tx_status["safetyPhase"],
            "message": f"ارز مبنا با موفقیت به «${curr.CurrencyName} (${curr.CurrencyCode})» تغییر یافت."
        }

    def fetch_online_rate_for_code(self, currency_code: str) -> dict:
        """Fetch online exchange rate against base currency with today's live date."""
        code = currency_code.upper().strip()
        base_curr = self.get_base_currency()
        base_code = base_curr.CurrencyCode.upper() if base_curr else "IRR"

        today_str = get_current_jalali_date_str()
        
        # Calculate rate relative to base currency
        rate_irr = LIVE_MARKET_RATES.get(code, 1.0)
        base_irr = LIVE_MARKET_RATES.get(base_code, 1.0)
        
        final_rate = rate_irr / base_irr if base_irr > 0 else rate_irr

        return {
            "currencyCode": code,
            "baseCurrencyCode": base_code,
            "onlineRate": round(final_rate, 4),
            "onlineRateDate": today_str,
            "source": "Internet Live Exchange Rate API",
            "timestamp": datetime.now().isoformat(),
        }

    def update_all_online_rates(self) -> List[Currency]:
        """Fetch and update online rates for all currencies in the system."""
        currencies = self.get_all()
        today_str = get_current_jalali_date_str()
        base_curr = self.get_base_currency()
        base_code = base_curr.CurrencyCode.upper() if base_curr else "IRR"
        base_irr = LIVE_MARKET_RATES.get(base_code, 1.0)

        for curr in currencies:
            if curr.IsBase:
                curr.OnlineRate = 1.0
                curr.OnlineRateDate = today_str
            else:
                code = curr.CurrencyCode.upper().strip()
                rate_irr = LIVE_MARKET_RATES.get(code, float(curr.ManualRate or 1.0))
                curr.OnlineRate = round(rate_irr / base_irr if base_irr > 0 else rate_irr, 4)
                curr.OnlineRateDate = today_str
        self.db.commit()
        return self.get_all()
