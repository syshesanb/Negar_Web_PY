from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.domain.models import SarfaslHesab, SanadHeader, SanadDetail
from app.schemas.schemas import AccountCreateDTO, SanadHeaderCreateDTO


class AccountingService:
    def __init__(self, db: Session):
        self.db = db

    # -------------------------------------------------------------------------
    # Chart of Accounts (SarfaslHesab)
    # -------------------------------------------------------------------------
    def get_accounts(self, company_id: int) -> List[SarfaslHesab]:
        return (
            self.db.query(SarfaslHesab)
            .filter(SarfaslHesab.CompanyID == company_id)
            .order_by(SarfaslHesab.AccountCode)
            .all()
        )

    def save_account(self, account_dto: AccountCreateDTO) -> SarfaslHesab:
        account = None
        if account_dto.AccountID and account_dto.AccountID > 0:
            account = self.db.query(SarfaslHesab).filter(SarfaslHesab.AccountID == account_dto.AccountID).first()
        if not account:
            account = self.db.query(SarfaslHesab).filter(
                SarfaslHesab.CompanyID == account_dto.CompanyID,
                SarfaslHesab.AccountCode == account_dto.AccountCode
            ).first()

        if account:
            account.CompanyID = account_dto.CompanyID
            account.AccountCode = account_dto.AccountCode
            account.AccountName = account_dto.AccountName
            account.AccountType = account_dto.AccountType
            account.ParentAccountID = account_dto.ParentAccountID
            account.IsActive = account_dto.IsActive
            account.AccountNature = account_dto.AccountNature
            self.db.commit()
            self.db.refresh(account)
            return account

        # Create new account
        new_account = SarfaslHesab(
            CompanyID=account_dto.CompanyID,
            AccountCode=account_dto.AccountCode,
            AccountName=account_dto.AccountName,
            AccountType=account_dto.AccountType,
            ParentAccountID=account_dto.ParentAccountID,
            IsActive=account_dto.IsActive,
            AccountNature=account_dto.AccountNature,
        )
        self.db.add(new_account)
        self.db.commit()
        self.db.refresh(new_account)
        return new_account

    def delete_account(self, account_id: int) -> bool:
        account = self.db.query(SarfaslHesab).filter(SarfaslHesab.AccountID == account_id).first()
        if not account:
            return False
        self.db.delete(account)
        self.db.commit()
        return True

    # -------------------------------------------------------------------------
    # Journal Entries (Sanad)
    # -------------------------------------------------------------------------
    def get_sanad_list(self, company_id: int, fiscal_year_id: int) -> List[SanadHeader]:
        return (
            self.db.query(SanadHeader)
            .options(joinedload(SanadHeader.Details).joinedload(SanadDetail.Account))
            .filter(SanadHeader.CompanyID == company_id, SanadHeader.FiscalYearID == fiscal_year_id)
            .order_by(SanadHeader.EntryID.desc())
            .all()
        )

    def save_sanad(self, dto: SanadHeaderCreateDTO) -> SanadHeader:
        # Calculate debit, credit totals and balance
        total_debit = sum(d.DebitAmount for d in dto.Details)
        total_credit = sum(d.CreditAmount for d in dto.Details)
        taeaz = "متوازن" if abs(total_debit - total_credit) < 0.001 else "نامتوازن"

        if dto.EntryID and dto.EntryID > 0:
            header = self.db.query(SanadHeader).filter(SanadHeader.EntryID == dto.EntryID).first()
            if header:
                header.CompanyID = dto.CompanyID
                header.FiscalYearID = dto.FiscalYearID
                if dto.EntryDate:
                    header.EntryDate = dto.EntryDate
                header.Description = dto.Description
                header.ReferenceNumber = dto.ReferenceNumber
                header.SharhSanad = dto.SharhSanad
                header.VazeiatSanad = dto.VazeiatSanad
                header.AdamVirayesh = dto.AdamVirayesh
                header.JamBedehkar = total_debit
                header.JamBestankar = total_credit
                header.TaeazSanad = taeaz

                # Clear old details and replace
                self.db.query(SanadDetail).filter(SanadDetail.EntryID == header.EntryID).delete()
                for idx, det in enumerate(dto.Details, start=1):
                    new_detail = SanadDetail(
                        EntryID=header.EntryID,
                        AccountID=det.AccountID,
                        DebitAmount=det.DebitAmount,
                        CreditAmount=det.CreditAmount,
                        LineNumber=det.LineNumber or idx,
                        ShenavarID=det.ShenavarID,
                        SharhRadif=det.SharhRadif,
                        TransactionNumber=det.TransactionNumber,
                        TransactionDate=det.TransactionDate,
                    )
                    self.db.add(new_detail)

                self.db.commit()
                self.db.refresh(header)
                return header

        # Create new SanadHeader
        new_header = SanadHeader(
            CompanyID=dto.CompanyID,
            FiscalYearID=dto.FiscalYearID,
            EntryDate=dto.EntryDate or datetime.utcnow(),
            Description=dto.Description,
            ReferenceNumber=dto.ReferenceNumber,
            CreatedBy=dto.CreatedBy,
            JamBedehkar=total_debit,
            JamBestankar=total_credit,
            TaeazSanad=taeaz,
            SharhSanad=dto.SharhSanad,
            VazeiatSanad=dto.VazeiatSanad,
            AdamVirayesh=dto.AdamVirayesh,
        )
        self.db.add(new_header)
        self.db.flush()  # Get generated EntryID

        for idx, det in enumerate(dto.Details, start=1):
            new_detail = SanadDetail(
                EntryID=new_header.EntryID,
                AccountID=det.AccountID,
                DebitAmount=det.DebitAmount,
                CreditAmount=det.CreditAmount,
                LineNumber=det.LineNumber or idx,
                ShenavarID=det.ShenavarID,
                SharhRadif=det.SharhRadif,
                TransactionNumber=det.TransactionNumber,
                TransactionDate=det.TransactionDate,
            )
            self.db.add(new_detail)

        self.db.commit()
        self.db.refresh(new_header)
        return new_header

    def delete_sanad(self, entry_id: int) -> bool:
        sanad = self.db.query(SanadHeader).filter(SanadHeader.EntryID == entry_id).first()
        if not sanad:
            return False
        self.db.delete(sanad)
        self.db.commit()
        return True
