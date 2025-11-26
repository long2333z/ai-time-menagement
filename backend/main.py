from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
from contextlib import asynccontextmanager

from database import engine, get_db, Base
from routers import auth, tasks, insights, goals, habits, admin, ai_config, logs, chat
from models import User, Task, Insight, Goal, Habit, AIConfig, Subscription, ChatMessage
from database import print_db_info
from logger import logger
from middleware import LoggingMiddleware

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting AI Time Management API...")
    print_db_info()
    
    # 初始化默认管理员账户
    try:
        from init_admin import create_admin_user
        db = next(get_db())
        create_admin_user(db)
        db.close()
    except Exception as e:
        logger.warning(f"⚠️  Admin initialization: {str(e)}")
    
    yield
    # Shutdown
    logger.info("👋 Shutting down...")

app = FastAPI(
    title="AI Time Management API",
    description="智能时间管理系统后端API",
    version="1.0.0",
    lifespan=lifespan
)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(habits.router, prefix="/api/habits", tags=["Habits"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai_config.router, prefix="/api/ai-config", tags=["AI Configuration"])
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
async def root():
    return {
        "message": "AI Time Management API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Mount static files (frontend) - MUST be at the end to avoid conflicts with API routes
import os
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
    print("📁 Static files mounted at /")
else:
    print("⚠️  Static directory not found. Frontend will be served separately in development.")