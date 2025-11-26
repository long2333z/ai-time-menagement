from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Goal, User
from routers.auth import get_current_user

router = APIRouter()

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    target_value: Optional[float] = None
    unit: Optional[str] = None
    start_date: datetime
    end_date: datetime

class GoalResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    type: str
    target_value: Optional[float]
    current_value: float
    unit: Optional[str]
    start_date: datetime
    end_date: datetime
    status: str
    progress: int
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[GoalResponse])
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    return goals

@router.post("/", response_model=GoalResponse)
async def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_goal = Goal(user_id=current_user.id, **goal_data.dict())
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal
