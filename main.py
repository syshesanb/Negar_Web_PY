import os
import sys
import io
import threading
import time
import webbrowser
from pathlib import Path

# Ensure UTF-8 encoding in Windows Console
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.infrastructure.database import init_db
from app.api import api_router

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Enable CORS for Web & Mobile Clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event: Initialize Database & Default Seed Data
@app.on_event("startup")
def on_startup():
    init_db()

# Mount API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

# Swagger redirect for /swagger to /docs (ASP.NET Core style)
@app.get("/swagger", include_in_schema=False)
def swagger_redirect():
    return RedirectResponse(url="/docs")

# Static files & SPA Single Page Application Support
static_path = settings.STATIC_DIR

def get_current_app_theme(request: Request) -> str:
    """Get active theme from app_theme.json, request cookies, or database settings."""
    import json
    
    # 1. First priority: Check app_theme.json file
    theme_file = settings.BASE_DIR / "app_theme.json"
    if theme_file.exists():
        try:
            data = json.loads(theme_file.read_text(encoding="utf-8"))
            if data.get("theme") in ("blue", "dark", "light"):
                return data["theme"]
        except Exception:
            pass

    # 2. Second priority: Check request cookies
    cookie_theme = request.cookies.get("negar_theme")
    if cookie_theme in ("blue", "dark", "light"):
        return cookie_theme

    # 3. Third priority: Check database AppSetting
    try:
        from app.infrastructure.database import SessionLocal
        from app.domain.models import AppSetting
        db = SessionLocal()
        try:
            s = db.query(AppSetting).filter(AppSetting.SettingKey == "AppTheme").first()
            if s and s.SettingValue in ("blue", "dark", "light"):
                return s.SettingValue
        finally:
            db.close()
    except Exception:
        pass
    return "blue"


def render_themed_html(request: Request) -> HTMLResponse:
    """Render index.html with active theme pre-injected into the <html> tag."""
    index_file = static_path / "index.html"
    if not index_file.exists():
        return HTMLResponse("<h1>Negar Web API running</h1>")
    content = index_file.read_text(encoding="utf-8")
    theme = get_current_app_theme(request)
    # Pre-inject theme into HTML tag so page loads with zero flicker
    import re
    content = re.sub(r'data-theme="[^"]*"', f'data-theme="{theme}"', content, count=1)
    response = HTMLResponse(content)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.set_cookie("negar_theme", theme, max_age=31536000, samesite="lax")
    return response


if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

    # Serve index.html for root path
    @app.get("/", include_in_schema=False)
    async def serve_index(request: Request):
        return render_themed_html(request)

    # Catch-all route for static assets and SPA fallback
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_static_or_fallback(request: Request, full_path: str):
        # Don't intercept API or Docs routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        
        file_path = static_path / full_path
        if file_path.exists() and file_path.is_file():
            if full_path.endswith(".html") or full_path == "index.html":
                return render_themed_html(request)
            return FileResponse(
                file_path,
                headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
            )
        
        # Fallback to index.html for client-side routing
        return render_themed_html(request)


def open_browser_delayed():
    """Wait 1.5 seconds and open the web browser automatically."""
    time.sleep(1.5)
    url = "http://localhost:8000"
    try:
        # Check standard Chrome path first
        chrome_paths = [
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        ]
        opened = False
        for cp in chrome_paths:
            if os.path.exists(cp):
                webbrowser.register("chrome", None, webbrowser.BackgroundBrowser(cp))
                webbrowser.get("chrome").open(url)
                opened = True
                break
        if not opened:
            webbrowser.open(url)
    except Exception:
        webbrowser.open(url)


if __name__ == "__main__":
    print("=" * 60)
    print(" 🚀 اجرای سرور وب نگار (Negar Web Application - Python)")
    print(" 🌐 آدرس سامانه: http://localhost:8000")
    print(" 📑 مستندات API و Swagger: http://localhost:8000/docs")
    print(" 👤 نام کاربری پیش‌فرض: admin")
    print(" 🔑 رمز عبور پیش‌فرض: admin123")
    print("=" * 60)
    
    # Start browser opener in background thread
    threading.Thread(target=open_browser_delayed, daemon=True).start()
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
