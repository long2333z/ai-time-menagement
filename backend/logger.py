import logging
import os
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from datetime import datetime
import json

# 日志目录
LOG_DIR = os.getenv("LOG_DIR", "./logs")
os.makedirs(LOG_DIR, exist_ok=True)

# 日志级别
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# 日志格式
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
JSON_LOG_FORMAT = {
    "timestamp": "%(asctime)s",
    "logger": "%(name)s",
    "level": "%(levelname)s",
    "message": "%(message)s",
    "module": "%(module)s",
    "function": "%(funcName)s",
    "line": "%(lineno)d"
}

class JSONFormatter(logging.Formatter):
    """
    JSON格式的日志格式化器
    """
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "logger": record.name,
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # 添加异常信息
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # 添加额外字段
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "ip_address"):
            log_data["ip_address"] = record.ip_address
        
        return json.dumps(log_data, ensure_ascii=False)


def setup_logger(name: str = "ai_time_management", use_json: bool = False) -> logging.Logger:
    """
    设置日志记录器
    
    Args:
        name: 日志记录器名称
        use_json: 是否使用JSON格式
    
    Returns:
        配置好的日志记录器
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, LOG_LEVEL.upper()))
    
    # 避免重复添加处理器
    if logger.handlers:
        return logger
    
    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    if use_json:
        console_handler.setFormatter(JSONFormatter())
    else:
        console_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    
    logger.addHandler(console_handler)
    
    # 文件处理器 - 按大小轮转
    file_handler = RotatingFileHandler(
        filename=os.path.join(LOG_DIR, f"{name}.log"),
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    
    if use_json:
        file_handler.setFormatter(JSONFormatter())
    else:
        file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    
    logger.addHandler(file_handler)
    
    # 错误日志文件处理器 - 按时间轮转
    error_handler = TimedRotatingFileHandler(
        filename=os.path.join(LOG_DIR, f"{name}_error.log"),
        when="midnight",
        interval=1,
        backupCount=30,
        encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(error_handler)
    
    return logger


# 创建默认日志记录器
logger = setup_logger()


def log_request(request_id: str, method: str, path: str, user_id: str = None, ip_address: str = None):
    """
    记录API请求
    """
    extra = {
        "request_id": request_id,
        "user_id": user_id,
        "ip_address": ip_address
    }
    logger.info(f"Request: {method} {path}", extra=extra)


def log_response(request_id: str, status_code: int, duration: float):
    """
    记录API响应
    """
    extra = {"request_id": request_id}
    logger.info(f"Response: {status_code} - Duration: {duration:.3f}s", extra=extra)


def log_error(request_id: str, error: Exception, user_id: str = None):
    """
    记录错误
    """
    extra = {
        "request_id": request_id,
        "user_id": user_id
    }
    logger.error(f"Error: {str(error)}", exc_info=True, extra=extra)


def log_database_query(query: str, duration: float, user_id: str = None):
    """
    记录数据库查询
    """
    extra = {"user_id": user_id}
    logger.debug(f"DB Query: {query} - Duration: {duration:.3f}s", extra=extra)


def log_auth_event(event_type: str, user_id: str, ip_address: str, success: bool):
    """
    记录认证事件
    """
    extra = {
        "user_id": user_id,
        "ip_address": ip_address
    }
    level = logging.INFO if success else logging.WARNING
    logger.log(level, f"Auth Event: {event_type} - Success: {success}", extra=extra)


# 导出日志记录器
__all__ = [
    "logger",
    "setup_logger",
    "log_request",
    "log_response",
    "log_error",
    "log_database_query",
    "log_auth_event"
]
