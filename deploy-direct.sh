#!/bin/bash

# AI时间管理系统 - 直接部署（不使用Docker）
# 服务器信息
SERVER_IP="43.134.233.165"
SERVER_USER="root"
DEPLOY_PATH="/opt/ai-time-management"
SSH_KEY="$HOME/.ssh/ai_time_key"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AI时间管理系统 - 直接部署${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 检查文件
echo -e "\n${GREEN}[1/6]${NC} 检查部署文件..."
if [ ! -f "${SSH_KEY}" ]; then
    echo -e "${RED}错误: SSH密钥文件不存在${NC}"
    exit 1
fi

if [ ! -d "backend/static" ]; then
    echo -e "${RED}错误: 未找到frontend构建文件${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 文件检查完成"

# 2. 测试SSH
echo -e "\n${GREEN}[2/6]${NC} 测试SSH连接..."
ssh -i ${SSH_KEY} -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "echo '连接成功'" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: SSH连接失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} SSH连接正常"

# 3. 打包文件
echo -e "\n${GREEN}[3/6]${NC} 打包项目文件..."
tar -czf ai-time-app.tar.gz \
    --exclude="backend/__pycache__" \
    --exclude="backend/venv" \
    --exclude="backend/*.db" \
    backend/

echo -e "${GREEN}✓${NC} 打包完成"

# 4. 上传文件
echo -e "\n${GREEN}[4/6]${NC} 上传文件到服务器..."
scp -i ${SSH_KEY} -o StrictHostKeyChecking=no ai-time-app.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 文件上传失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 文件上传完成"

# 5. 在服务器上部署
echo -e "\n${GREEN}[5/6]${NC} 在服务器上部署应用..."

ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[服务器] 开始部署...${NC}"

# 创建目录
mkdir -p /opt/ai-time-management
cd /opt/ai-time-management

# 解压文件
echo -e "${BLUE}[服务器] 解压文件...${NC}"
tar -xzf /tmp/ai-time-app.tar.gz
rm /tmp/ai-time-app.tar.gz

# 检查Python
echo -e "${BLUE}[服务器] 检查Python环境...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}安装Python3...${NC}"
    apt-get update -qq
    apt-get install -y -qq python3 python3-pip python3-venv
fi

echo -e "${GREEN}✓${NC} Python: $(python3 --version)"

# 创建虚拟环境
echo -e "${BLUE}[服务器] 创建虚拟环境...${NC}"
cd backend
python3 -m venv venv
source venv/bin/activate

# 安装依赖
echo -e "${BLUE}[服务器] 安装Python依赖...${NC}"
pip install --quiet --no-cache-dir -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 依赖安装失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 依赖安装完成"

# 创建.env文件（如果不存在）
if [ ! -f .env ]; then
    echo -e "${BLUE}[服务器] 创建配置文件...${NC}"

    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 32)

    cat > .env << EOF
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=s2x3sgo2
DATABASE_USER=ai_time_user
DATABASE_PASSWORD=your_password_here

JWT_SECRET_KEY=${JWT_SECRET}
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

ENCRYPTION_KEY=${ENCRYPTION_KEY}
EOF
    echo -e "${YELLOW}⚠️  配置文件已创建${NC}"
fi

# 停止旧服务
echo -e "${BLUE}[服务器] 停止旧服务...${NC}"
pkill -f "uvicorn main:app" || true
sleep 2

# 启动服务
echo -e "${BLUE}[服务器] 启动应用...${NC}"
nohup venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > logs/app.log 2>&1 &

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 启动失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 应用已启动"
sleep 5

# 检查进程
if pgrep -f "uvicorn main:app" > /dev/null; then
    echo -e "${GREEN}✓${NC} 应用运行正常"
else
    echo -e "${RED}错误: 应用未运行${NC}"
    exit 1
fi

# 安装Nginx（如果没有）
if ! command -v nginx &> /dev/null; then
    echo -e "${BLUE}[服务器] 安装Nginx...${NC}"
    apt-get update -qq
    apt-get install -y -qq nginx
    systemctl enable nginx
fi

# 配置Nginx
echo -e "${BLUE}[服务器] 配置Nginx...${NC}"
cat > /etc/nginx/sites-available/ai-time << 'NGINXCONF'
server {
    listen 80;
    server_name _;

    # 静态文件
    location / {
        root /opt/ai-time-management/backend/static;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API文档
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }
}
NGINXCONF

# 启用站点
ln -sf /etc/nginx/sites-available/ai-time /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: Nginx配置错误${NC}"
    exit 1
fi

# 重启Nginx
systemctl restart nginx

echo -e "${GREEN}✓${NC} Nginx配置完成"

# 配置防火墙
if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
    ufw allow 80/tcp 2>/dev/null || true
    echo -e "${GREEN}✓${NC} 防火墙已配置"
fi

echo -e "${GREEN}[服务器] 部署完成！${NC}"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}部署失败${NC}"
    exit 1
fi

# 6. 验证部署
echo -e "\n${GREEN}[6/6]${NC} 验证部署..."
sleep 3

# 测试HTTP
echo -e "${BLUE}测试HTTP访问...${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}/ 2>/dev/null || echo "000")
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "304" ]; then
    echo -e "${GREEN}✓${NC} 应用访问正常 (HTTP ${HTTP_RESPONSE})"
else
    echo -e "${YELLOW}⚠${NC} HTTP响应码: ${HTTP_RESPONSE}"
fi

# 测试API
echo -e "${BLUE}测试API接口...${NC}"
API_RESPONSE=$(curl -s http://${SERVER_IP}/api/health 2>/dev/null || echo "")
if echo "$API_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} API接口正常"
else
    echo -e "${YELLOW}⚠${NC} API响应: ${API_RESPONSE}"
fi

# 清理
rm -f ai-time-app.tar.gz

# 完成
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}📱 访问地址：${NC}"
echo -e "  ${GREEN}http://${SERVER_IP}/${NC}"
echo -e "  API文档: ${GREEN}http://${SERVER_IP}/docs${NC}"

echo -e "\n${BLUE}🔧 管理命令：${NC}"
echo -e "  查看日志: ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} 'tail -f /opt/ai-time-management/backend/logs/app.log'"
echo -e "  重启服务: ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management/backend && source venv/bin/activate && pkill -f uvicorn && nohup uvicorn main:app --host 0.0.0.0 --port 8000 > logs/app.log 2>&1 &'"
echo -e "  查看进程: ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} 'ps aux | grep uvicorn'"

echo -e "\n${YELLOW}⚠️  重要提示：${NC}"
echo -e "  1. 默认管理员账号："
echo -e "     用户名: ${BLUE}admin${NC}"
echo -e "     密码: ${BLUE}admin123${NC} ${RED}(请登录后立即修改)${NC}"
echo -e "  2. 确保云服务器安全组已开放 ${BLUE}80端口${NC}"
echo -e "  3. 配置数据库：${BLUE}/opt/ai-time-management/backend/.env${NC}"

echo ""
