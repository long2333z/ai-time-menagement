from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

from database import get_db
from models import User, Task, Insight, AdminUser, AuditLog

router = APIRouter()

# Simplified admin authentication (in production, use proper admin auth)
class AdminStats(BaseModel):
    total_users: int
    active_users_today: int
    total_tasks: int
    completed_tasks: int
    total_insights: int
    premium_users: int
    pro_users: int

class UserListItem(BaseModel):
    id: str
    email: str
    name: str
    subscription_tier: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(db: Session = Depends(get_db)):
    # In production, add admin authentication
    
    total_users = db.query(func.count(User.id)).scalar()
    
    # Active users today (users who created tasks today)
    today = datetime.utcnow().date()
    active_users_today = db.query(func.count(func.distinct(Task.user_id))).filter(
        func.date(Task.created_at) == today
    ).scalar()
    
    total_tasks = db.query(func.count(Task.id)).scalar()
    completed_tasks = db.query(func.count(Task.id)).filter(Task.status == "completed").scalar()
    total_insights = db.query(func.count(Insight.id)).scalar()
    
    premium_users = db.query(func.count(User.id)).filter(User.subscription_tier == "premium").scalar()
    pro_users = db.query(func.count(User.id)).filter(User.subscription_tier == "pro").scalar()
    
    return {
        "total_users": total_users or 0,
        "active_users_today": active_users_today or 0,
        "total_tasks": total_tasks or 0,
        "completed_tasks": completed_tasks or 0,
        "total_insights": total_insights or 0,
        "premium_users": premium_users or 0,
        "pro_users": pro_users or 0
    }

@router.get("/users", response_model=List[UserListItem])
async def get_users_list(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    # In production, add admin authentication
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}")
async def get_user_detail(user_id: str, db: Session = Depends(get_db)):
    # In production, add admin authentication
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user statistics
    task_count = db.query(func.count(Task.id)).filter(Task.user_id == user_id).scalar()
    completed_task_count = db.query(func.count(Task.id)).filter(
        Task.user_id == user_id,
        Task.status == "completed"
    ).scalar()
    
    return {
        "user": user,
        "stats": {
            "total_tasks": task_count or 0,
            "completed_tasks": completed_task_count or 0
        }
    }
