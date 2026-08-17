from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.schemas.schemas import (
    AccountDTO,
    AccountCreateDTO,
    SanadHeaderDTO,
    SanadHeaderCreateDTO,
)
from app.services.accounting_service import AccountingService

router = APIRouter()


# -----------------------------------------------------------------------------
# Accounts (سرفصل‌های حسابداری)
# -----------------------------------------------------------------------------
@router.get("/accounts/{company_id}", response_model=List[AccountDTO])
def get_accounts(company_id: int, db: Session = Depends(get_db)):
    service = AccountingService(db)
    return service.get_accounts(company_id)


@router.post("/accounts", response_model=AccountDTO)
def save_account(account: AccountCreateDTO, db: Session = Depends(get_db)):
    service = AccountingService(db)
    return service.save_account(account)


@router.delete("/accounts/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    service = AccountingService(db)
    success = service.delete_account(account_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="سرفصل مورد نظر یافت نشد.")
    return {"success": True, "message": "حساب با موفقیت حذف شد."}


# -----------------------------------------------------------------------------
# Sanad (اسناد حسابداری)
# -----------------------------------------------------------------------------
@router.get("/sanad/{company_id}/{fiscal_year_id}", response_model=List[SanadHeaderDTO])
def get_sanad_list(company_id: int, fiscal_year_id: int, db: Session = Depends(get_db)):
    service = AccountingService(db)
    return service.get_sanad_list(company_id, fiscal_year_id)


@router.post("/sanad", response_model=SanadHeaderDTO)
def save_sanad(sanad: SanadHeaderCreateDTO, db: Session = Depends(get_db)):
    service = AccountingService(db)
    return service.save_sanad(sanad)


@router.delete("/sanad/{entry_id}")
def delete_sanad(entry_id: int, db: Session = Depends(get_db)):
    service = AccountingService(db)
    success = service.delete_sanad(entry_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="سند مورد نظر یافت نشد.")
    return {"success": True, "message": "سند با موفقیت حذف شد."}
