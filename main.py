import os
import sys
import io
import threading
import time
import webbrowser
from pathlib import Path

# Ensure UTF-8 encoding in Windows Console
if sys.stdout and hasattr(sys.stdout, "buffer"):
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "buffer"):
    try:
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, RedirectResponse
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

if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

    # Serve index.html for root path
    @app.get("/", include_in_schema=False)
    async def serve_index():
        index_file = static_path / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "Negar Web API running"}

    # Catch-all route for static assets and SPA fallback
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_static_or_fallback(full_path: str):
        # Don't intercept API or Docs routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        
        file_path = static_path / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        
        # Fallback to index.html for client-side routing
        index_file = static_path / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "Not Found"}


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
