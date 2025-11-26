from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

from database import get_db
from models import ChatMessage, User
from routers.auth import get_current_user

router = APIRouter()

class ChatMessageCreate(BaseModel):
    session_id: Optional[str] = None
    role: str
    content: str
    message_metadata: Optional[dict] = None

class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    message_metadata: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    session_id: str
    message_count: int
    first_message: str
    last_message_at: datetime

@router.post("/messages", response_model=ChatMessageResponse)
async def create_chat_message(
    message_data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建聊天消息
    """
    try:
        # 如果没有提供session_id，创建新的
        session_id = message_data.session_id or str(uuid.uuid4())
        
        new_message = ChatMessage(
            user_id=current_user.id,
            session_id=session_id,
            role=message_data.role,
            content=message_data.content,
            message_metadata=message_data.message_metadata
        )
        
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        
        return new_message
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")

@router.get("/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    session_id: Optional[str] = Query(None, description="会话ID"),
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(50, ge=1, le=200, description="返回数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取聊天消息列表
    """
    try:
        query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
        
        if session_id:
            query = query.filter(ChatMessage.session_id == session_id)
        
        messages = query.order_by(ChatMessage.created_at.asc()).offset(skip).limit(limit).all()
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(20, ge=1, le=100, description="返回数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取聊天会话列表
    """
    try:
        # 查询所有会话，按最后消息时间排序
        sessions = db.query(
            ChatMessage.session_id,
            func.count(ChatMessage.id).label('message_count'),
            func.min(ChatMessage.content).label('first_message'),
            func.max(ChatMessage.created_at).label('last_message_at')
        ).filter(
            ChatMessage.user_id == current_user.id
        ).group_by(
            ChatMessage.session_id
        ).order_by(
            desc('last_message_at')
        ).offset(skip).limit(limit).all()
        
        return [
            ChatSessionResponse(
                session_id=session.session_id,
                message_count=session.message_count,
                first_message=session.first_message[:100] if session.first_message else "",
                last_message_at=session.last_message_at
            )
            for session in sessions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除聊天会话及其所有消息
    """
    try:
        deleted_count = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.session_id == session_id
        ).delete()
        
        db.commit()
        
        return {
            "message": "Session deleted successfully",
            "deleted_messages": deleted_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")

@router.delete("/messages/{message_id}")
async def delete_chat_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除单条聊天消息
    """
    try:
        message = db.query(ChatMessage).filter(
            ChatMessage.id == message_id,
            ChatMessage.user_id == current_user.id
        ).first()
        
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        db.delete(message)
        db.commit()
        
        return {"message": "Message deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete message: {str(e)}")

@router.get("/export")
async def export_chat_history(
    session_id: Optional[str] = Query(None, description="会话ID，不提供则导出所有"),
    format: str = Query("json", description="导出格式: json, txt"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    导出聊天历史
    """
    try:
        query = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
        
        if session_id:
            query = query.filter(ChatMessage.session_id == session_id)
        
        messages = query.order_by(ChatMessage.created_at.asc()).all()
        
        if format == "txt":
            # 文本格式导出
            lines = []
            for msg in messages:
                timestamp = msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
                lines.append(f"[{timestamp}] {msg.role.upper()}: {msg.content}\n")
            
            content = "\n".join(lines)
            
            from fastapi.responses import Response
            return Response(
                content=content,
                media_type="text/plain",
                headers={
                    "Content-Disposition": f"attachment; filename=chat_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
                }
            )
        else:
            # JSON格式导出
            data = [
                {
                    "id": msg.id,
                    "session_id": msg.session_id,
                    "role": msg.role,
                    "content": msg.content,
                    "message_metadata": msg.message_metadata,
                    "created_at": msg.created_at.isoformat()
                }
                for msg in messages
            ]
            
            import json
            from fastapi.responses import Response
            return Response(
                content=json.dumps(data, ensure_ascii=False, indent=2),
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename=chat_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export chat history: {str(e)}")

@router.get("/stats")
async def get_chat_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取聊天统计信息
    """
    try:
        total_messages = db.query(func.count(ChatMessage.id)).filter(
            ChatMessage.user_id == current_user.id
        ).scalar()
        
        total_sessions = db.query(func.count(func.distinct(ChatMessage.session_id))).filter(
            ChatMessage.user_id == current_user.id
        ).scalar()
        
        user_messages = db.query(func.count(ChatMessage.id)).filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.role == "user"
        ).scalar()
        
        assistant_messages = db.query(func.count(ChatMessage.id)).filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.role == "assistant"
        ).scalar()
        
        return {
            "total_messages": total_messages or 0,
            "total_sessions": total_sessions or 0,
            "user_messages": user_messages or 0,
            "assistant_messages": assistant_messages or 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat stats: {str(e)}")
