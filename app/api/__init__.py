from fastapi import APIRouter
from app.api.auth_routes import router as auth_router
from app.api.accounting_routes import router as accounting_router
from app.api.inventory_routes import router as inventory_router
from app.api.dashboard_routes import router as dashboard_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/Auth", tags=["Auth"])
api_router.include_router(accounting_router, prefix="/Accounting", tags=["Accounting"])
api_router.include_router(inventory_router, prefix="/Inventory", tags=["Inventory"])
api_router.include_router(dashboard_router, prefix="/Dashboard", tags=["Dashboard"])

# Also support lower-case prefixes for convenience
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"], include_in_schema=False)
api_router.include_router(accounting_router, prefix="/accounting", tags=["Accounting"], include_in_schema=False)
api_router.include_router(inventory_router, prefix="/inventory", tags=["Inventory"], include_in_schema=False)
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"], include_in_schema=False)
