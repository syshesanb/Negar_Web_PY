from sqlalchemy.orm import Session
from sqlalchemy import func
from app.domain.models import (
    Company,
    UserAccount,
    Product,
    Warehouse,
    SalesInvoice,
    PurchaseInvoice,
    SanadHeader,
)
from app.schemas.schemas import DashboardSummary


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_summary(self) -> DashboardSummary:
        total_companies = self.db.query(func.count(Company.CompanyID)).scalar() or 0
        total_users = self.db.query(func.count(UserAccount.UserID)).scalar() or 0
        total_products = self.db.query(func.count(Product.ProductID)).scalar() or 0
        total_warehouses = self.db.query(func.count(Warehouse.WarehouseID)).scalar() or 0
        total_sales_inv = self.db.query(func.count(SalesInvoice.InvoiceID)).scalar() or 0
        total_purch_inv = self.db.query(func.count(PurchaseInvoice.InvoiceID)).scalar() or 0
        total_sanad = self.db.query(func.count(SanadHeader.EntryID)).scalar() or 0
        total_sales_amount = float(self.db.query(func.sum(SalesInvoice.TotalAmount)).scalar() or 0.0)
        total_purch_amount = float(self.db.query(func.sum(PurchaseInvoice.TotalAmount)).scalar() or 0.0)

        return DashboardSummary(
            totalCompanies=total_companies,
            totalUsers=total_users,
            totalProducts=total_products,
            totalWarehouses=total_warehouses,
            totalInvoices=total_sales_inv + total_purch_inv,
            totalSanadEntries=total_sanad,
            totalSalesAmount=total_sales_amount,
            totalPurchaseAmount=total_purch_amount,
        )

    def get_theme(self) -> str:
        import json
        from pathlib import Path
        from app.domain.models import AppSetting
        
        # 1. First check config file
        theme_file = Path(__file__).resolve().parent.parent.parent / "app_theme.json"
        if theme_file.exists():
            try:
                data = json.loads(theme_file.read_text(encoding="utf-8"))
                if data.get("theme") in ("blue", "dark", "light"):
                    return data["theme"]
            except Exception:
                pass

        # 2. Then check database
        setting = self.db.query(AppSetting).filter(AppSetting.SettingKey == "AppTheme").first()
        return setting.SettingValue if setting and setting.SettingValue else "blue"

    def set_theme(self, theme: str) -> str:
        import json
        from pathlib import Path
        from app.domain.models import AppSetting
        
        # 1. Save to database
        setting = self.db.query(AppSetting).filter(AppSetting.SettingKey == "AppTheme").first()
        if not setting:
            setting = AppSetting(SettingKey="AppTheme", SettingValue=theme, SettingCategory="Appearance")
            self.db.add(setting)
        else:
            setting.SettingValue = theme
        self.db.commit()

        # 2. Save to app_theme.json file for permanent persistence
        try:
            theme_file = Path(__file__).resolve().parent.parent.parent / "app_theme.json"
            theme_file.write_text(json.dumps({"theme": theme}, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception:
            pass

        return theme
