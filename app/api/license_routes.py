from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.services.license_service import LicenseService, get_machine_fingerprint

router = APIRouter()
license_service = LicenseService()


@router.get("/status")
def get_license_status() -> Dict[str, Any]:
    """Get current deployment mode, license details, limits and server fingerprint."""
    return license_service.get_status()


@router.get("/fingerprint")
def get_server_fingerprint() -> Dict[str, str]:
    """Get the host server machine fingerprint to generate an On-Premise hardware-bound license."""
    return {
        "serverFingerprint": get_machine_fingerprint()
    }


@router.post("/activate")
def activate_license(payload: Dict[str, str] = Body(...)) -> Dict[str, Any]:
    """Activate or renew license with a cryptographically signed license token."""
    token = payload.get("token", "").strip()
    if not token:
        raise HTTPException(status_code=400, detail="کلید لایسنس ارسال نشده است.")
    
    result = license_service.activate(token)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result
