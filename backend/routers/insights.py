from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Insight, User
from routers.auth import get_current_user

router = APIRouter()

class InsightCreate(BaseModel):
    type: str
    title: str
    description: str
    priority: str = "medium"
    actionable: bool = False
    action_text: Optional[str] = None

class InsightResponse(BaseModel):
    id: str
    type: str
    title: str
    description: str
    priority: str
    actionable: bool
    action_text: Optional[str]
    is_read: bool
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[InsightResponse])
async def get_insights(
    skip: int = 0,
    limit: int = 50,
    is_read: Optional[bool] = None,
    is_favorite: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Insight).filter(Insight.user_id == current_user.id)
    
    if is_read is not None:
        query = query.filter(Insight.is_read == is_read)
    if is_favorite is not None:
        query = query.filter(Insight.is_favorite == is_favorite)
    
    insights = query.order_by(Insight.created_at.desc()).offset(skip).limit(limit).all()
    return insights

@router.post("/", response_model=InsightResponse)
async def create_insight(
    insight_data: InsightCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_insight = Insight(
        user_id=current_user.id,
        **insight_data.dict()
    )
    
    db.add(new_insight)
    db.commit()
    db.refresh(new_insight)
    
    return new_insight

@router.put("/{insight_id}/read")
async def mark_insight_read(
    insight_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    insight = db.query(Insight).filter(
        Insight.id == insight_id,
        Insight.user_id == current_user.id
    ).first()
    
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    insight.is_read = True
    db.commit()
    
    return {"message": "Insight marked as read"}

@router.put("/{insight_id}/favorite")
async def toggle_insight_favorite(
    insight_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    insight = db.query(Insight).filter(
        Insight.id == insight_id,
        Insight.user_id == current_user.id
    ).first()
    
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    insight.is_favorite = not insight.is_favorite
    db.commit()
    
    return {"message": "Insight favorite toggled", "is_favorite": insight.is_favorite}
