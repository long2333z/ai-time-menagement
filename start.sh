#!/bin/bash

# ================================================
# AI时间管理系统 - Linux/Mac启动脚本
# ================================================

set -e

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

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 显示帮助
show_usage() {
    echo ""
    echo "用法: ./start.sh [模式]"
    echo ""
    echo "模式:"
    echo "  dev      - 开发模式 (默认)"
    echo "  help     - 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./start.sh          启动开发环境"
    echo "  ./start.sh dev      启动开发环境"
    echo "  ./start.sh help     显示帮助"
    echo ""
    exit 0
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# 主函数
main() {
    # 解析参数
    MODE=${1:-dev}
    
    if [ "$MODE" = "help" ] || [ "$MODE" = "-h" ] || [ "$MODE" = "--help" ]; then
        show_usage
    fi
    
    echo "================================================"
    echo "  AI时间管理系统 - 启动脚本"
    echo "================================================"
    echo ""
    
    print_info "启动模式: $MODE"
    echo ""
    
    # 检查Node.js
    print_info "[1/4] 检查Node.js..."
    if ! command_exists node; then
        print_error "Node.js 未安装，请先安装 Node.js 18+"
        echo "下载地址: https://nodejs.org/"
        exit 1
    fi
    NODE_VERSION=$(node --version)
    print_success "Node.js: $NODE_VERSION"
    echo ""
    
    # 检查Python
    print_info "[2/4] 检查Python..."
    if ! command_exists python3; then
        print_error "Python 未安装，请先安装 Python 3.10+"
        echo "下载地址: https://www.python.org/"
        exit 1
    fi
    PYTHON_VERSION=$(python3 --version)
    print_success "$PYTHON_VERSION"
    echo ""
    
    # 安装前端依赖
    print_info "[3/4] 检查前端依赖..."
    if [ ! -d "node_modules" ]; then
        print_info "安装前端依赖..."
        npm install
        print_success "前端依赖安装完成"
    else
        print_success "前端依赖已安装"
    fi
    echo ""
    
    # 安装后端依赖
    print_info "[4/4] 检查后端依赖..."
    cd backend
    
    if [ ! -d "venv" ]; then
        print_info "创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境并安装依赖
    source venv/bin/activate
    pip install -r requirements.txt > /dev/null 2>&1 || {
        print_info "安装后端依赖..."
        pip install -r requirements.txt
    }
    print_success "后端依赖已安装"
    
    # 初始化管理员账户
    print_info "初始化管理员账户..."
    python3 init_admin.py > /dev/null 2>&1 || true
    
    cd ..
    echo ""
    
    # 创建日志目录
    mkdir -p logs
    
    # 检查端口占用
    if check_port 8000; then
        print_warning "端口 8000 已被占用"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    if check_port 3000; then
        print_warning "端口 3000 已被占用"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # 启动服务
    echo "================================================"
    echo "  启动服务"
    echo "================================================"
    echo ""
    
    # 启动后端
    print_info "启动后端服务 (端口 8000)..."
    cd backend
    source venv/bin/activate
    nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    cd ..
    
    # 等待后端启动
    print_info "等待后端服务启动..."
    sleep 5
    
    # 检查后端是否启动成功
    if check_port 8000; then
        print_success "后端服务启动成功 (PID: $BACKEND_PID)"
    else
        print_error "后端服务启动失败，请检查日志 logs/backend.log"
        exit 1
    fi
    
    # 启动前端
    print_info "启动前端服务 (端口 3000)..."
    nohup npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend.pid
    
    # 等待前端启动
    sleep 3
    
    # 检查前端是否启动成功
    if check_port 3000; then
        print_success "前端服务启动成功 (PID: $FRONTEND_PID)"
    else
        print_error "前端服务启动失败，请检查日志 logs/frontend.log"
        exit 1
    fi
    
    echo ""
    echo "================================================"
    echo "  启动完成！"
    echo "================================================"
    echo ""
    echo "前端地址: http://localhost:3000"
    echo "后端地址: http://localhost:8000"
    echo "API文档:  http://localhost:8000/docs"
    echo ""
    echo "日志文件:"
    echo "  后端: logs/backend.log"
    echo "  前端: logs/frontend.log"
    echo ""
    echo "停止服务: ./stop.sh"
    echo ""
    
    # 保存PID信息
    echo "BACKEND_PID=$BACKEND_PID" > logs/pids.txt
    echo "FRONTEND_PID=$FRONTEND_PID" >> logs/pids.txt
}

# 运行主函数
main "$@"
