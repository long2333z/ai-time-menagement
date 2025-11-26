#!/bin/bash

echo "🔍 AI时间管理系统 - 项目检查工具"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
PASS=0
FAIL=0
WARN=0

# 检查函数
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

echo "📦 检查依赖..."
echo "-----------------------------------"

# 检查Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js 已安装: $NODE_VERSION"
else
    check_fail "Node.js 未安装"
fi

# 检查npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_pass "npm 已安装: $NPM_VERSION"
else
    check_fail "npm 未安装"
fi

# 检查Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    check_pass "Python 已安装: $PYTHON_VERSION"
else
    check_fail "Python 未安装"
fi

# 检查pip
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version)
    check_pass "pip 已安装: $PIP_VERSION"
else
    check_fail "pip 未安装"
fi

echo ""
echo "📁 检查项目文件..."
echo "-----------------------------------"

# 检查关键文件
if [ -f "package.json" ]; then
    check_pass "package.json 存在"
else
    check_fail "package.json 不存在"
fi

if [ -f "vite.config.ts" ]; then
    check_pass "vite.config.ts 存在"
else
    check_fail "vite.config.ts 不存在"
fi

if [ -f "backend/main.py" ]; then
    check_pass "backend/main.py 存在"
else
    check_fail "backend/main.py 不存在"
fi

if [ -f "backend/requirements.txt" ]; then
    check_pass "backend/requirements.txt 存在"
else
    check_fail "backend/requirements.txt 不存在"
fi

if [ -f "backend/database.py" ]; then
    check_pass "backend/database.py 存在"
else
    check_fail "backend/database.py 不存在"
fi

echo ""
echo "🔧 检查前端依赖..."
echo "-----------------------------------"

if [ -d "node_modules" ]; then
    check_pass "node_modules 目录存在"
else
    check_warn "node_modules 目录不存在，需要运行: npm install"
fi

echo ""
echo "🐍 检查后端依赖..."
echo "-----------------------------------"

# 检查Python包
if python3 -c "import fastapi" 2>/dev/null; then
    check_pass "fastapi 已安装"
else
    check_warn "fastapi 未安装，需要运行: pip3 install -r backend/requirements.txt"
fi

if python3 -c "import uvicorn" 2>/dev/null; then
    check_pass "uvicorn 已安装"
else
    check_warn "uvicorn 未安装，需要运行: pip3 install -r backend/requirements.txt"
fi

if python3 -c "import sqlalchemy" 2>/dev/null; then
    check_pass "sqlalchemy 已安装"
else
    check_warn "sqlalchemy 未安装，需要运行: pip3 install -r backend/requirements.txt"
fi

if python3 -c "import pymysql" 2>/dev/null; then
    check_pass "pymysql 已安装"
else
    check_warn "pymysql 未安装，需要运行: pip3 install -r backend/requirements.txt"
fi

echo ""
echo "⚙️  检查配置文件..."
echo "-----------------------------------"

if [ -f "backend/.env" ]; then
    check_pass "backend/.env 配置文件存在"
    
    # 检查数据库配置
    if grep -q "DATABASE_TYPE" backend/.env; then
        DB_TYPE=$(grep "DATABASE_TYPE" backend/.env | cut -d'=' -f2)
        echo "   数据库类型: $DB_TYPE"
    else
        check_warn "未配置 DATABASE_TYPE (默认使用 SQLite)"
    fi
else
    check_warn "backend/.env 不存在 (将使用默认配置)"
    echo "   提示: 复制 backend/.env.example 为 backend/.env 进行自定义配置"
fi

echo ""
echo "🌐 检查端口占用..."
echo "-----------------------------------"

# 检查3000端口
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    check_warn "端口 3000 已被占用 (前端端口)"
else
    check_pass "端口 3000 可用 (前端)"
fi

# 检查8000端口
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    check_warn "端口 8000 已被占用 (后端端口)"
else
    check_pass "端口 8000 可用 (后端)"
fi

echo ""
echo "=================================="
echo "📊 检查结果汇总"
echo "=================================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${YELLOW}警告: $WARN${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ 项目检查通过！${NC}"
    echo ""
    echo "🚀 启动建议："
    echo ""
    
    if [ ! -d "node_modules" ]; then
        echo "1. 安装前端依赖:"
        echo "   npm install"
        echo ""
    fi
    
    if ! python3 -c "import fastapi" 2>/dev/null; then
        echo "2. 安装后端依赖:"
        echo "   cd backend && pip3 install -r requirements.txt"
        echo ""
    fi
    
    echo "3. 启动后端 (新终端):"
    echo "   cd backend"
    echo "   uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo "4. 启动前端 (新终端):"
    echo "   npm run dev"
    echo ""
    echo "5. 访问应用:"
    echo "   前端: http://localhost:3000"
    echo "   后端API: http://localhost:8000"
    echo "   API文档: http://localhost:8000/docs"
    echo ""
else
    echo -e "${RED}✗ 项目检查发现问题，请先解决上述失败项${NC}"
    echo ""
fi

echo "💡 提示："
echo "   - 默认使用 SQLite 数据库，无需额外配置"
echo "   - 如需使用 MySQL，请配置 backend/.env 文件"
echo "   - 详细文档请查看 QUICK_START.md"
echo ""
