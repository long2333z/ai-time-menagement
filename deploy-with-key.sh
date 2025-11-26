#!/bin/bash

# AI时间管理系统 - 使用指定SSH密钥的完整部署脚本
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
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AI时间管理系统 - 完整自动化部署${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 检查本地必要文件
echo -e "\n${GREEN}[1/8]${NC} 检查部署文件..."
if [ ! -f "${SSH_KEY}" ]; then
    echo -e "${RED}错误: SSH密钥文件不存在${NC}"
    exit 1
fi

if [ ! -d "backend/static" ]; then
    echo -e "${RED}错误: 未找到frontend构建文件${NC}"
    exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}错误: 未找到docker-compose.yml${NC}"
    exit 1
fi

if [ ! -f "nginx.conf" ]; then
    echo -e "${RED}错误: 未找到nginx.conf${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 文件检查完成"

# 2. 测试SSH连接
echo -e "\n${GREEN}[2/8]${NC} 测试SSH连接..."
ssh -i ${SSH_KEY} -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "echo '连接成功'" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: SSH连接失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} SSH连接正常"

# 3. 在服务器上安装Docker环境
echo -e "\n${GREEN}[3/8]${NC} 检查并安装Docker环境..."

ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[服务器] 检查Docker是否已安装...${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker已安装: $(docker --version)"
else
    echo -e "${YELLOW}Docker未安装，开始安装...${NC}"

    # 检测操作系统
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        echo -e "${RED}无法检测操作系统${NC}"
        exit 1
    fi

    echo -e "${BLUE}[服务器] 操作系统: ${OS}${NC}"

    # 更新包管理器
    echo -e "${BLUE}[服务器] 更新包管理器...${NC}"
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get update -qq
        apt-get install -y -qq ca-certificates curl gnupg lsb-release
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y -q yum-utils
    fi

    # 使用Docker官方安装脚本
    echo -e "${BLUE}[服务器] 使用官方脚本安装Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh

    # 启动Docker服务
    systemctl start docker
    systemctl enable docker

    # 清理安装脚本
    rm -f get-docker.sh

    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker安装成功: $(docker --version)"
    else
        echo -e "${RED}错误: Docker安装失败${NC}"
        exit 1
    fi
fi

# 检查Docker Compose
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose已安装: $(docker compose version)"
elif command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose已安装: $(docker-compose --version)"
else
    echo -e "${RED}错误: Docker Compose未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker环境准备完成"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}Docker环境安装失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker环境就绪"

# 4. 打包项目文件
echo -e "\n${GREEN}[4/8]${NC} 打包项目文件..."
tar -czf ai-time-management-full.tar.gz \
    --exclude="backend/__pycache__" \
    --exclude="backend/venv" \
    --exclude="backend/*.db" \
    --exclude="backend/.env" \
    backend/ \
    docker-compose.yml \
    nginx.conf

echo -e "${GREEN}✓${NC} 打包完成"

# 5. 上传到服务器
echo -e "\n${GREEN}[5/8]${NC} 上传文件到服务器..."
scp -i ${SSH_KEY} -o StrictHostKeyChecking=no ai-time-management-full.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 文件上传失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 文件上传完成"

# 6. 在服务器上部署应用
echo -e "\n${GREEN}[6/8]${NC} 在服务器上部署应用..."

ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[服务器] 开始部署应用...${NC}"

# 创建部署目录
mkdir -p /opt/ai-time-management
cd /opt/ai-time-management

# 解压文件
echo -e "${BLUE}[服务器] 解压应用文件...${NC}"
tar -xzf /tmp/ai-time-management-full.tar.gz
rm /tmp/ai-time-management-full.tar.gz

# 创建必要的目录
mkdir -p nginx-logs backend/logs backend/data

# 创建.env文件
if [ ! -f backend/.env ]; then
    echo -e "${BLUE}[服务器] 创建环境配置文件...${NC}"

    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 32)

    cat > backend/.env << EOF
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=s2x3sgo2
DATABASE_USER=ai_time_user
DATABASE_PASSWORD=your_password_here

# JWT配置
JWT_SECRET_KEY=${JWT_SECRET}
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# 加密密钥
ENCRYPTION_KEY=${ENCRYPTION_KEY}
EOF
    echo -e "${YELLOW}⚠️  环境配置文件已创建${NC}"
fi

# 使用docker compose或docker-compose
DOCKER_COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
fi

# 停止旧服务
echo -e "${BLUE}[服务器] 停止旧服务...${NC}"
$DOCKER_COMPOSE_CMD down 2>/dev/null || true

# 清理旧镜像
docker image prune -f > /dev/null 2>&1

# 启动服务
echo -e "${BLUE}[服务器] 启动服务（构建镜像并启动容器）...${NC}"
$DOCKER_COMPOSE_CMD up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 服务启动失败${NC}"
    $DOCKER_COMPOSE_CMD logs
    exit 1
fi

echo -e "${GREEN}✓${NC} 服务启动成功"

# 等待服务启动
echo -e "${BLUE}[服务器] 等待服务初始化...${NC}"
sleep 15

# 检查服务状态
echo -e "${BLUE}[服务器] 检查容器状态...${NC}"
$DOCKER_COMPOSE_CMD ps

# 配置防火墙
if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
    echo -e "${BLUE}[服务器] 配置防火墙...${NC}"
    ufw allow 80/tcp 2>/dev/null || true
    echo -e "${GREEN}✓${NC} 防火墙已配置"
fi

echo -e "${GREEN}[服务器] 应用部署完成！${NC}"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}应用部署失败${NC}"
    exit 1
fi

# 7. 清理本地临时文件
echo -e "\n${GREEN}[7/8]${NC} 清理临时文件..."
rm -f ai-time-management-full.tar.gz
echo -e "${GREEN}✓${NC} 清理完成"

# 8. 验证部署
echo -e "\n${GREEN}[8/8]${NC} 验证部署..."
sleep 5

# 测试80端口
echo -e "${BLUE}测试HTTP访问...${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}/ 2>/dev/null || echo "000")
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "304" ]; then
    echo -e "${GREEN}✓${NC} 应用访问正常 (HTTP ${HTTP_RESPONSE})"
else
    echo -e "${YELLOW}⚠${NC} HTTP响应码: ${HTTP_RESPONSE}"
    echo -e "${YELLOW}如无法访问，请检查云服务器安全组是否开放80端口${NC}"
fi

# 测试API健康检查
echo -e "${BLUE}测试API健康检查...${NC}"
HEALTH_CHECK=$(curl -s http://${SERVER_IP}/api/health 2>/dev/null || echo "")
if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} API接口正常"
else
    echo -e "${YELLOW}⚠${NC} API接口响应: ${HEALTH_CHECK}"
fi

# 完成
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}📱 访问地址：${NC}"
echo -e "  ${GREEN}http://${SERVER_IP}/${NC}"
echo -e "  API文档: ${GREEN}http://${SERVER_IP}/docs${NC}"

echo -e "\n${BLUE}🔧 管理命令：${NC}"
echo -e "  查看日志: ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose logs -f'"
echo -e "  重启服务: ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose restart'"
echo -e "  查看状态: ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose ps'"

echo -e "\n${YELLOW}⚠️  重要提示：${NC}"
echo -e "  1. 默认管理员账号："
echo -e "     用户名: ${BLUE}admin${NC}"
echo -e "     密码: ${BLUE}admin123${NC} ${RED}(请登录后立即修改)${NC}"
echo -e "  2. 确保云服务器安全组已开放 ${BLUE}80端口${NC}"
echo -e "  3. 如需配置数据库，编辑服务器上的: ${BLUE}/opt/ai-time-management/backend/.env${NC}"

echo ""
