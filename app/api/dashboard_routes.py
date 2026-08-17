from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.schemas.schemas import DashboardSummary
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
@router.get("", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    service = DashboardService(db)
    return service.get_summary()


@router.get("/theme")
def get_theme(db: Session = Depends(get_db)):
    service = DashboardService(db)
    return {"theme": service.get_theme()}


@router.post("/theme")
def set_theme(payload: dict = Body(...), db: Session = Depends(get_db)):
    theme = payload.get("theme", "blue")
    service = DashboardService(db)
    saved = service.set_theme(theme)
    return {"theme": saved, "success": True}
