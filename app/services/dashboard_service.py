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
