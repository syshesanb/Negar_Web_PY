from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.domain.models import Product, Warehouse, InventoryRecord
from app.schemas.schemas import ProductCreateDTO, WarehouseCreateDTO


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    # -------------------------------------------------------------------------
    # Products
    # -------------------------------------------------------------------------
    def get_products(self, company_id: Optional[int] = None) -> List[Product]:
        query = self.db.query(Product)
        if company_id is not None:
            query = query.filter(Product.CompanyID == company_id)
        return query.order_by(Product.ProductCode).all()

    def save_product(self, dto: ProductCreateDTO) -> Product:
        if dto.ProductID and dto.ProductID > 0:
            product = self.db.query(Product).filter(Product.ProductID == dto.ProductID).first()
            if product:
                for field, val in dto.dict(exclude_unset=True).items():
                    if hasattr(product, field):
                        setattr(product, field, val)
                self.db.commit()
                self.db.refresh(product)
                return product

        new_product = Product(**dto.dict(exclude={"ProductID"}))
        self.db.add(new_product)
        self.db.commit()
        self.db.refresh(new_product)
        return new_product

    # -------------------------------------------------------------------------
    # Warehouses
    # -------------------------------------------------------------------------
    def get_warehouses(self, company_id: Optional[int] = None) -> List[Warehouse]:
        query = self.db.query(Warehouse)
        if company_id is not None:
            query = query.filter(Warehouse.CompanyID == company_id)
        return query.order_by(Warehouse.WarehouseName).all()

    def save_warehouse(self, dto: WarehouseCreateDTO) -> Warehouse:
        if dto.WarehouseID and dto.WarehouseID > 0:
            wh = self.db.query(Warehouse).filter(Warehouse.WarehouseID == dto.WarehouseID).first()
            if wh:
                for field, val in dto.dict(exclude_unset=True).items():
                    if hasattr(wh, field):
                        setattr(wh, field, val)
                self.db.commit()
                self.db.refresh(wh)
                return wh

        new_wh = Warehouse(**dto.dict(exclude={"WarehouseID"}))
        self.db.add(new_wh)
        self.db.commit()
        self.db.refresh(new_wh)
        return new_wh

    # -------------------------------------------------------------------------
    # Stock / Inventory
    # -------------------------------------------------------------------------
    def get_inventory_stock(
        self, company_id: Optional[int] = None, warehouse_id: Optional[int] = None
    ) -> List[InventoryRecord]:
        query = (
            self.db.query(InventoryRecord)
            .options(joinedload(InventoryRecord.Product), joinedload(InventoryRecord.Warehouse))
        )
        if warehouse_id is not None:
            query = query.filter(InventoryRecord.WarehouseID == warehouse_id)
        return query.all()
