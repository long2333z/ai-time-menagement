#!/bin/bash

# ================================================
# AI时间管理系统 - Linux/Mac停止脚本
# ================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "================================================"
echo "  停止AI时间管理系统"
echo "================================================"
echo ""

# 从PID文件读取进程ID
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    print_info "停止后端服务 (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null && print_success "后端服务已停止" || print_info "后端服务未运行"
    rm -f logs/backend.pid
else
    print_info "停止后端服务..."
    # 查找并停止uvicorn进程
    pkill -f "uvicorn main:app" && print_success "后端服务已停止" || print_info "后端服务未运行"
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    print_info "停止前端服务 (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null && print_success "前端服务已停止" || print_info "前端服务未运行"
    rm -f logs/frontend.pid
else
    print_info "停止前端服务..."
    # 查找并停止vite进程
    pkill -f "vite" && print_success "前端服务已停止" || print_info "前端服务未运行"
fi

# 清理PID文件
rm -f logs/pids.txt

# 询问是否清理日志
echo ""
read -p "是否清理日志文件？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f logs/*.log
    print_success "日志文件已清理"
fi

echo ""
echo "================================================"
echo "  所有服务已停止"
echo "================================================"
echo ""
