from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.schemas.schemas import (
    ProductDTO,
    ProductCreateDTO,
    ProductGroupDTO,
    ProductGroupCreateDTO,
    WarehouseDTO,
    WarehouseCreateDTO,
    InventoryRecordDTO,
)
from app.services.inventory_service import InventoryService

router = APIRouter()


# -----------------------------------------------------------------------------
# Product Groups (گروه‌بندی کالاها)
# -----------------------------------------------------------------------------
@router.get("/product-groups", response_model=List[ProductGroupDTO])
def get_product_groups(
    companyId: Optional[int] = Query(None, alias="companyId"),
    company_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    cid = companyId if companyId is not None else company_id
    service = InventoryService(db)
    return service.get_product_groups(cid)


@router.post("/product-groups", response_model=ProductGroupDTO)
def save_product_group(group: ProductGroupCreateDTO, db: Session = Depends(get_db)):
    service = InventoryService(db)
    return service.save_product_group(group)


@router.delete("/product-groups/{group_id}")
def delete_product_group(group_id: int, db: Session = Depends(get_db)):
    service = InventoryService(db)
    success = service.delete_product_group(group_id)
    return {"success": success}


# -----------------------------------------------------------------------------
# Products (کالاها)
# -----------------------------------------------------------------------------
@router.get("/products", response_model=List[ProductDTO])
def get_products(
    companyId: Optional[int] = Query(None, alias="companyId"),
    company_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    cid = companyId if companyId is not None else company_id
    service = InventoryService(db)
    return service.get_products(cid)


@router.post("/products", response_model=ProductDTO)
def save_product(product: ProductCreateDTO, db: Session = Depends(get_db)):
    service = InventoryService(db)
    return service.save_product(product)


# -----------------------------------------------------------------------------
# Warehouses (انبارها)
# -----------------------------------------------------------------------------
@router.get("/warehouses", response_model=List[WarehouseDTO])
def get_warehouses(
    companyId: Optional[int] = Query(None, alias="companyId"),
    company_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    cid = companyId if companyId is not None else company_id
    service = InventoryService(db)
    return service.get_warehouses(cid)


@router.post("/warehouses", response_model=WarehouseDTO)
def save_warehouse(warehouse: WarehouseCreateDTO, db: Session = Depends(get_db)):
    service = InventoryService(db)
    return service.save_warehouse(warehouse)


# -----------------------------------------------------------------------------
# Stock (موجودی انبار)
# -----------------------------------------------------------------------------
@router.get("/stock", response_model=List[InventoryRecordDTO])
def get_stock(
    companyId: Optional[int] = Query(None, alias="companyId"),
    warehouseId: Optional[int] = Query(None, alias="warehouseId"),
    company_id: Optional[int] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    cid = companyId if companyId is not None else company_id
    wid = warehouseId if warehouseId is not None else warehouse_id
    service = InventoryService(db)
    return service.get_inventory_stock(cid, wid)
