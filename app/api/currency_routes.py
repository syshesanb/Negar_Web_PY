from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.schemas.schemas import CurrencyDTO, CurrencyCreateDTO, CurrencyUpdateDTO
from app.services.currency_service import CurrencyService

router = APIRouter()


@router.get("", response_model=List[CurrencyDTO])
def get_all_currencies(db: Session = Depends(get_db)):
    service = CurrencyService(db)
    return service.get_all()


@router.post("", response_model=CurrencyDTO)
def create_currency(dto: CurrencyCreateDTO, db: Session = Depends(get_db)):
    service = CurrencyService(db)
    return service.create(dto)


@router.get("/base", response_model=CurrencyDTO)
def get_base_currency(db: Session = Depends(get_db)):
    service = CurrencyService(db)
    base = service.get_base_currency()
    if not base:
        raise HTTPException(status_code=404, detail="ارز مبنا تعریف نشده است.")
    return base


@router.get("/online-rate/{currency_code}")
def fetch_online_rate(currency_code: str, db: Session = Depends(get_db)):
    service = CurrencyService(db)
    return service.fetch_online_rate_for_code(currency_code)


@router.post("/update-all-online", response_model=List[CurrencyDTO])
def update_all_online_rates(db: Session = Depends(get_db)):
    service = CurrencyService(db)
    return service.update_all_online_rates()


@router.get("/{currency_id}", response_model=CurrencyDTO)
def get_currency_by_id(currency_id: int, db: Session = Depends(get_db)):
    service = CurrencyService(db)
    curr = service.get_by_id(currency_id)
    if not curr:
        raise HTTPException(status_code=404, detail="ارز یافت نشد.")
    return curr


@router.put("/{currency_id}", response_model=CurrencyDTO)
def update_currency(currency_id: int, dto: CurrencyUpdateDTO, db: Session = Depends(get_db)):
    service = CurrencyService(db)
    updated = service.update(currency_id, dto)
    if not updated:
        raise HTTPException(status_code=404, detail="ارز برای ویرایش یافت نشد.")
    return updated


@router.get("/transaction-status")
def get_transaction_status(db: Session = Depends(get_db)):
    service = CurrencyService(db)
    return service.get_financial_transactions_status()


@router.delete("/{currency_id}")
def delete_currency(currency_id: int, db: Session = Depends(get_db)):
    service = CurrencyService(db)
    success = service.delete(currency_id)
    if not success:
        raise HTTPException(status_code=404, detail="ارز برای حذف یافت نشد.")
    return {"message": "ارز با موفقیت حذف گردید.", "success": True}


@router.post("/{currency_id}/set-base")
def set_base_currency(
    currency_id: int, 
    user_role: str = Query("SuperAdmin"),
    force_confirm: bool = Query(False),
    db: Session = Depends(get_db)
):
    service = CurrencyService(db)
    result = service.set_as_base(currency_id, user_role=user_role, force_confirm=force_confirm)
    if not result.get("success"):
        if result.get("error") == "permission_denied":
            raise HTTPException(status_code=403, detail=result.get("message"))
        elif result.get("error") == "transactions_exist":
            return result
        elif result.get("error") == "not_found":
            raise HTTPException(status_code=404, detail=result.get("message"))
    return result
