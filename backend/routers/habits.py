from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import Habit, User
from routers.auth import get_current_user

router = APIRouter()

class HabitCreate(BaseModel):
    title: str
    description: Optional[str] = None
    frequency: str = "daily"
    target_days: Optional[List[int]] = None

class HabitResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    frequency: str
    target_days: Optional[List[int]]
    streak: int
    longest_streak: int

    class Config:
        from_attributes = True

@router.get("/", response_model=List[HabitResponse])
async def get_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    return habits

@router.post("/", response_model=HabitResponse)
async def create_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_habit = Habit(user_id=current_user.id, **habit_data.dict())
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit
