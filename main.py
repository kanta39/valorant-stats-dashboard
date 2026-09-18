"""
Main application entry point for Render and local development.
Points to backend.main:app to ensure all modular routes and database caching are active.
"""
from backend.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
