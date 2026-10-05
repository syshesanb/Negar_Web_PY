from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.domain.models import Product, ProductGroup, ProductUnit, Warehouse, InventoryRecord
from app.schemas.schemas import ProductCreateDTO, ProductGroupCreateDTO, ProductUnitCreateDTO, WarehouseCreateDTO


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    # -------------------------------------------------------------------------
    # Product Groups
    # -------------------------------------------------------------------------
    def get_product_groups(self, company_id: Optional[int] = None) -> List[dict]:
        query = self.db.query(ProductGroup)
        if company_id is not None:
            query = query.filter(ProductGroup.CompanyID == company_id)
        groups = query.order_by(ProductGroup.GroupCode).all()

        result = []
        for g in groups:
            parent_name = g.ParentGroup.GroupName if g.ParentGroup else "-"
            result.append({
                "GroupID": g.GroupID,
                "CompanyID": g.CompanyID,
                "ParentID": g.ParentID,
                "GroupCode": g.GroupCode,
                "GroupName": g.GroupName,
                "Level": g.Level,
                "IsActive": g.IsActive,
                "ParentName": parent_name,
            })
        return result

    def save_product_group(self, dto: ProductGroupCreateDTO) -> dict:
        if dto.GroupID and dto.GroupID > 0:
            pg = self.db.query(ProductGroup).filter(ProductGroup.GroupID == dto.GroupID).first()
            if pg:
                for field, val in dto.dict(exclude_unset=True).items():
                    if hasattr(pg, field):
                        setattr(pg, field, val)
                self.db.commit()
                self.db.refresh(pg)
                parent_name = pg.ParentGroup.GroupName if pg.ParentGroup else "-"
                return {
                    "GroupID": pg.GroupID,
                    "CompanyID": pg.CompanyID,
                    "ParentID": pg.ParentID,
                    "GroupCode": pg.GroupCode,
                    "GroupName": pg.GroupName,
                    "Level": pg.Level,
                    "IsActive": pg.IsActive,
                    "ParentName": parent_name,
                }

        new_pg = ProductGroup(**dto.dict(exclude={"GroupID"}))
        self.db.add(new_pg)
        self.db.commit()
        self.db.refresh(new_pg)
        parent_name = new_pg.ParentGroup.GroupName if new_pg.ParentGroup else "-"
        return {
            "GroupID": new_pg.GroupID,
            "CompanyID": new_pg.CompanyID,
            "ParentID": new_pg.ParentID,
            "GroupCode": new_pg.GroupCode,
            "GroupName": new_pg.GroupName,
            "Level": new_pg.Level,
            "IsActive": new_pg.IsActive,
            "ParentName": parent_name,
        }

    def delete_product_group(self, group_id: int) -> bool:
        pg = self.db.query(ProductGroup).filter(ProductGroup.GroupID == group_id).first()
        if pg:
            self.db.delete(pg)
            self.db.commit()
            return True
        return False

    # -------------------------------------------------------------------------
    # Product Units (واحدهای اندازه‌گیری)
    # -------------------------------------------------------------------------
    def get_product_units(self, company_id: Optional[int] = None) -> List[dict]:
        query = self.db.query(ProductUnit)
        if company_id is not None:
            query = query.filter(ProductUnit.CompanyID == company_id)
        units = query.order_by(ProductUnit.UnitCode).all()

        result = []
        for u in units:
            parent_name = u.ParentUnit.UnitName if u.ParentUnit else "-"
            result.append({
                "UnitID": u.UnitID,
                "CompanyID": u.CompanyID,
                "ParentID": u.ParentID,
                "UnitCode": u.UnitCode,
                "UnitName": u.UnitName,
                "Symbol": u.Symbol,
                "ConversionRatio": float(u.ConversionRatio or 1.0),
                "Level": u.Level,
                "IsActive": u.IsActive,
                "ParentName": parent_name,
            })
        return result

    def save_product_unit(self, dto: ProductUnitCreateDTO) -> dict:
        if dto.UnitID and dto.UnitID > 0:
            pu = self.db.query(ProductUnit).filter(ProductUnit.UnitID == dto.UnitID).first()
            if pu:
                for field, val in dto.dict(exclude_unset=True).items():
                    if hasattr(pu, field):
                        setattr(pu, field, val)
                self.db.commit()
                self.db.refresh(pu)
                parent_name = pu.ParentUnit.UnitName if pu.ParentUnit else "-"
                return {
                    "UnitID": pu.UnitID,
                    "CompanyID": pu.CompanyID,
                    "ParentID": pu.ParentID,
                    "UnitCode": pu.UnitCode,
                    "UnitName": pu.UnitName,
                    "Symbol": pu.Symbol,
                    "ConversionRatio": float(pu.ConversionRatio or 1.0),
                    "Level": pu.Level,
                    "IsActive": pu.IsActive,
                    "ParentName": parent_name,
                }

        new_pu = ProductUnit(**dto.dict(exclude={"UnitID"}))
        self.db.add(new_pu)
        self.db.commit()
        self.db.refresh(new_pu)
        parent_name = new_pu.ParentUnit.UnitName if new_pu.ParentUnit else "-"
        return {
            "UnitID": new_pu.UnitID,
            "CompanyID": new_pu.CompanyID,
            "ParentID": new_pu.ParentID,
            "UnitCode": new_pu.UnitCode,
            "UnitName": new_pu.UnitName,
            "Symbol": new_pu.Symbol,
            "ConversionRatio": float(new_pu.ConversionRatio or 1.0),
            "Level": new_pu.Level,
            "IsActive": new_pu.IsActive,
            "ParentName": parent_name,
        }

    def delete_product_unit(self, unit_id: int) -> bool:
        pu = self.db.query(ProductUnit).filter(ProductUnit.UnitID == unit_id).first()
        if pu:
            self.db.delete(pu)
            self.db.commit()
            return True
        return False

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
