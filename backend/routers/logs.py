from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import json

from database import get_db
from logger import logger, LOG_DIR

router = APIRouter()

class ErrorLogCreate(BaseModel):
    message: str
    stack: Optional[str] = None
    componentStack: Optional[str] = None
    userAgent: Optional[str] = None
    url: Optional[str] = None

class LogEntry(BaseModel):
    timestamp: str
    level: str
    logger: str
    message: str
    module: Optional[str] = None
    function: Optional[str] = None
    line: Optional[int] = None
    exception: Optional[str] = None

class LogQueryResponse(BaseModel):
    total: int
    logs: List[LogEntry]
    page: int
    page_size: int

@router.post("/error")
async def log_frontend_error(error_data: ErrorLogCreate):
    """
    接收前端错误日志
    """
    try:
        # 记录前端错误
        logger.error(
            f"Frontend Error: {error_data.message}",
            extra={
                "stack": error_data.stack,
                "component_stack": error_data.componentStack,
                "user_agent": error_data.userAgent,
                "url": error_data.url,
                "source": "frontend"
            }
        )
        
        return {"message": "Error logged successfully"}
    except Exception as e:
        logger.error(f"Failed to log frontend error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to log error")

@router.get("/", response_model=LogQueryResponse)
async def get_logs(
    level: Optional[str] = Query(None, description="日志级别: DEBUG, INFO, WARNING, ERROR"),
    start_date: Optional[str] = Query(None, description="开始日期 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="结束日期 (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(50, ge=1, le=200, description="每页数量")
):
    """
    查询日志
    """
    try:
        # 读取日志文件
        log_file = os.path.join(LOG_DIR, "ai_time_management.log")
        
        if not os.path.exists(log_file):
            return LogQueryResponse(
                total=0,
                logs=[],
                page=page,
                page_size=page_size
            )
        
        # 读取并解析日志
        logs = []
        with open(log_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    # 尝试解析JSON格式
                    log_entry = json.loads(line)
                    logs.append(LogEntry(**log_entry))
                except json.JSONDecodeError:
                    # 解析文本格式
                    parts = line.strip().split(' - ', 3)
                    if len(parts) >= 4:
                        logs.append(LogEntry(
                            timestamp=parts[0],
                            logger=parts[1],
                            level=parts[2],
                            message=parts[3]
                        ))
        
        # 过滤日志
        filtered_logs = logs
        
        if level:
            filtered_logs = [log for log in filtered_logs if log.level == level.upper()]
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            filtered_logs = [
                log for log in filtered_logs
                if datetime.fromisoformat(log.timestamp.split(',')[0]) >= start_dt
            ]
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
            filtered_logs = [
                log for log in filtered_logs
                if datetime.fromisoformat(log.timestamp.split(',')[0]) <= end_dt
            ]
        
        if search:
            filtered_logs = [
                log for log in filtered_logs
                if search.lower() in log.message.lower()
            ]
        
        # 分页
        total = len(filtered_logs)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_logs = filtered_logs[start_idx:end_idx]
        
        return LogQueryResponse(
            total=total,
            logs=paginated_logs,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"Failed to query logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to query logs")

@router.get("/stats")
async def get_log_stats():
    """
    获取日志统计信息
    """
    try:
        log_file = os.path.join(LOG_DIR, "ai_time_management.log")
        error_log_file = os.path.join(LOG_DIR, "ai_time_management_error.log")
        
        stats = {
            "total_logs": 0,
            "error_logs": 0,
            "log_file_size": 0,
            "error_log_file_size": 0,
            "last_updated": None
        }
        
        if os.path.exists(log_file):
            stats["log_file_size"] = os.path.getsize(log_file)
            stats["last_updated"] = datetime.fromtimestamp(
                os.path.getmtime(log_file)
            ).isoformat()
            
            # 统计日志数量
            with open(log_file, 'r', encoding='utf-8') as f:
                stats["total_logs"] = sum(1 for _ in f)
        
        if os.path.exists(error_log_file):
            stats["error_log_file_size"] = os.path.getsize(error_log_file)
            
            # 统计错误日志数量
            with open(error_log_file, 'r', encoding='utf-8') as f:
                stats["error_logs"] = sum(1 for _ in f)
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get log stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get log stats")

@router.delete("/")
async def clear_logs():
    """
    清除日志文件（仅开发环境）
    """
    if os.getenv("APP_ENV") == "production":
        raise HTTPException(status_code=403, detail="Cannot clear logs in production")
    
    try:
        log_file = os.path.join(LOG_DIR, "ai_time_management.log")
        error_log_file = os.path.join(LOG_DIR, "ai_time_management_error.log")
        
        if os.path.exists(log_file):
            open(log_file, 'w').close()
        
        if os.path.exists(error_log_file):
            open(error_log_file, 'w').close()
        
        logger.info("Logs cleared")
        
        return {"message": "Logs cleared successfully"}
        
    except Exception as e:
        logger.error(f"Failed to clear logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clear logs")
