from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import uuid
from logger import log_request, log_response, log_error


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    日志记录中间件
    记录所有API请求和响应
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # 生成请求ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # 获取客户端IP
        client_ip = request.client.host if request.client else "unknown"
        
        # 获取用户ID（如果已认证）
        user_id = None
        if hasattr(request.state, "user"):
            user_id = getattr(request.state.user, "id", None)
        
        # 记录请求
        log_request(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            user_id=user_id,
            ip_address=client_ip
        )
        
        # 记录开始时间
        start_time = time.time()
        
        try:
            # 处理请求
            response = await call_next(request)
            
            # 计算处理时间
            duration = time.time() - start_time
            
            # 记录响应
            log_response(
                request_id=request_id,
                status_code=response.status_code,
                duration=duration
            )
            
            # 添加请求ID到响应头
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            # 记录错误
            duration = time.time() - start_time
            log_error(request_id=request_id, error=e, user_id=user_id)
            
            # 重新抛出异常，让FastAPI的异常处理器处理
            raise


class CORSMiddleware(BaseHTTPMiddleware):
    """
    CORS中间件（如果需要自定义CORS逻辑）
    """
    
    def __init__(self, app: ASGIApp, allow_origins: list = None):
        super().__init__(app)
        self.allow_origins = allow_origins or ["*"]
    
    async def dispatch(self, request: Request, call_next):
        # 处理预检请求
        if request.method == "OPTIONS":
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
            return response
        
        # 处理正常请求
        response = await call_next(request)
        
        # 添加CORS头
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    简单的速率限制中间件
    """
    
    def __init__(self, app: ASGIApp, max_requests: int = 100, window: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window = window
        self.requests = {}
    
    async def dispatch(self, request: Request, call_next):
        # 获取客户端IP
        client_ip = request.client.host if request.client else "unknown"
        
        # 获取当前时间窗口
        current_window = int(time.time() / self.window)
        
        # 清理过期的记录
        self.requests = {
            k: v for k, v in self.requests.items()
            if k[1] >= current_window
        }
        
        # 检查请求次数
        key = (client_ip, current_window)
        count = self.requests.get(key, 0)
        
        if count >= self.max_requests:
            return Response(
                content="Too many requests",
                status_code=429,
                headers={"Retry-After": str(self.window)}
            )
        
        # 增加计数
        self.requests[key] = count + 1
        
        # 处理请求
        response = await call_next(request)
        
        # 添加速率限制头
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(self.max_requests - count - 1)
        response.headers["X-RateLimit-Reset"] = str((current_window + 1) * self.window)
        
        return response
