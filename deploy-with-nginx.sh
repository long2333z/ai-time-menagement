#!/bin/bash

# AI时间管理系统 - 完整部署脚本（带Nginx，80端口）
# 服务器信息
SERVER_IP="43.134.233.165"
SERVER_USER="root"  # 根据你的服务器用户修改
DEPLOY_PATH="/opt/ai-time-management"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AI时间管理系统 - Docker+Nginx部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 检查必要文件
echo -e "\n${GREEN}[1/7]${NC} 检查部署文件..."
if [ ! -d "backend/static" ]; then
    echo -e "${RED}错误: 未找到frontend构建文件，请先运行 npm run build${NC}"
    exit 1
fi

if [ ! -f "backend/Dockerfile" ]; then
    echo -e "${RED}错误: 未找到Dockerfile${NC}"
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

# 2. 打包项目文件
echo -e "\n${GREEN}[2/7]${NC} 打包项目文件..."
tar -czf ai-time-management-full.tar.gz \
    --exclude="backend/__pycache__" \
    --exclude="backend/venv" \
    --exclude="backend/*.db" \
    --exclude="backend/.env" \
    backend/ \
    docker-compose.yml \
    nginx.conf

echo -e "${GREEN}✓${NC} 打包完成: ai-time-management-full.tar.gz"

# 3. 上传到服务器
echo -e "\n${GREEN}[3/7]${NC} 上传文件到服务器..."
scp ai-time-management-full.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 文件上传失败，请检查SSH连接${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 文件上传完成"

# 4. 在服务器上执行部署
echo -e "\n${GREEN}[4/7]${NC} 在服务器上部署应用..."

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
# 设置颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[服务器] 开始部署...${NC}"

# 检查Docker和Docker Compose
echo -e "${BLUE}[服务器] 检查Docker环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装${NC}"
    echo -e "${YELLOW}请先安装Docker: curl -fsSL https://get.docker.com | sh${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装${NC}"
    echo -e "${YELLOW}请先安装Docker Compose${NC}"
    exit 1
fi

# 使用docker compose或docker-compose
DOCKER_COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✓${NC} Docker环境检查完成"

# 创建部署目录
echo -e "${BLUE}[服务器] 创建部署目录...${NC}"
mkdir -p /opt/ai-time-management
cd /opt/ai-time-management

# 解压文件
echo -e "${BLUE}[服务器] 解压应用文件...${NC}"
tar -xzf /tmp/ai-time-management-full.tar.gz
rm /tmp/ai-time-management-full.tar.gz

# 创建必要的目录
mkdir -p nginx-logs
mkdir -p backend/logs
mkdir -p backend/data

# 创建.env文件（如果不存在）
if [ ! -f backend/.env ]; then
    echo -e "${BLUE}[服务器] 创建环境配置文件...${NC}"

    # 生成随机密钥
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" 2>/dev/null || echo "请手动生成")

    cat > backend/.env << EOF
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=s2x3sgo2
DATABASE_USER=ai_time_user
DATABASE_PASSWORD=请修改为你的数据库密码

# JWT配置
JWT_SECRET_KEY=${JWT_SECRET}
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# 加密密钥（用于加密API密钥）
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# AI服务配置（可选，也可以通过管理后台配置）
# OPENAI_API_KEY=your-openai-key
# DEEPSEEK_API_KEY=your-deepseek-key
EOF
    echo -e "${YELLOW}⚠️  已生成随机JWT密钥${NC}"
    echo -e "${RED}⚠️  请编辑 /opt/ai-time-management/backend/.env 文件，修改数据库密码！${NC}"
fi

# 停止旧服务
echo -e "${BLUE}[服务器] 停止旧服务...${NC}"
$DOCKER_COMPOSE_CMD down 2>/dev/null || true

# 清理旧镜像
echo -e "${BLUE}[服务器] 清理旧镜像...${NC}"
docker image prune -f

# 启动服务
echo -e "${BLUE}[服务器] 启动服务...${NC}"
$DOCKER_COMPOSE_CMD up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 服务启动失败${NC}"
    echo -e "${YELLOW}查看日志: $DOCKER_COMPOSE_CMD logs${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 服务启动成功"

# 等待服务启动
echo -e "${BLUE}[服务器] 等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "${BLUE}[服务器] 检查服务状态...${NC}"
$DOCKER_COMPOSE_CMD ps

# 配置防火墙（如果使用firewalld）
if command -v firewall-cmd &> /dev/null; then
    echo -e "${BLUE}[服务器] 配置防火墙...${NC}"
    firewall-cmd --permanent --add-service=http 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    echo -e "${GREEN}✓${NC} 防火墙已配置（允许HTTP访问）"
fi

# 配置防火墙（如果使用ufw）
if command -v ufw &> /dev/null; then
    echo -e "${BLUE}[服务器] 配置防火墙...${NC}"
    ufw allow 80/tcp 2>/dev/null || true
    echo -e "${GREEN}✓${NC} 防火墙已配置（允许HTTP访问）"
fi

echo -e "${GREEN}[服务器] 部署完成！${NC}"

ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}部署失败${NC}"
    exit 1
fi

# 5. 清理本地临时文件
echo -e "\n${GREEN}[5/7]${NC} 清理临时文件..."
rm ai-time-management-full.tar.gz
echo -e "${GREEN}✓${NC} 清理完成"

# 6. 验证部署
echo -e "\n${GREEN}[6/7]${NC} 验证部署..."
sleep 5

# 测试80端口
echo -e "${BLUE}测试80端口访问...${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}/ || echo "000")
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "304" ]; then
    echo -e "${GREEN}✓${NC} 80端口访问正常"
else
    echo -e "${YELLOW}警告: 80端口访问异常 (HTTP ${HTTP_RESPONSE})${NC}"
    echo -e "${YELLOW}请检查防火墙和云服务器安全组设置${NC}"
fi

# 测试API
echo -e "${BLUE}测试API接口...${NC}"
HEALTH_CHECK=$(curl -s http://${SERVER_IP}/api/health || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} API接口正常"
else
    echo -e "${YELLOW}警告: API接口响应异常${NC}"
fi

# 7. 显示部署信息
echo -e "\n${GREEN}[7/7]${NC} 部署完成"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}访问地址：${NC}"
echo -e "  前端应用: ${GREEN}http://${SERVER_IP}/${NC}"
echo -e "  API文档:  ${GREEN}http://${SERVER_IP}/docs${NC}"
echo -e "  健康检查: ${GREEN}http://${SERVER_IP}/api/health${NC}"

echo -e "\n${BLUE}管理命令：${NC}"
echo -e "  查看日志: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker-compose logs -f'${NC}"
echo -e "  重启服务: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker-compose restart'${NC}"
echo -e "  停止服务: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker-compose stop'${NC}"
echo -e "  启动服务: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker-compose start'${NC}"

echo -e "\n${RED}重要提示：${NC}"
echo -e "  ${YELLOW}1. 请编辑服务器上的配置文件：${NC}"
echo -e "     ${BLUE}/opt/ai-time-management/backend/.env${NC}"
echo -e "  ${YELLOW}2. 修改数据库连接信息${NC}"
echo -e "  ${YELLOW}3. 修改后重启服务：${NC}"
echo -e "     ${BLUE}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker-compose restart'${NC}"
echo -e "  ${YELLOW}4. 确保云服务器安全组已开放80端口${NC}"
echo -e "  ${YELLOW}5. 默认管理员账号：${NC}"
echo -e "     用户名: ${BLUE}admin${NC}"
echo -e "     密码: ${BLUE}admin123${NC} ${RED}(首次登录后请立即修改！)${NC}"

echo -e "\n${BLUE}故障排查：${NC}"
echo -e "  如果无法访问，请检查："
echo -e "  1. 云服务器安全组是否开放80端口"
echo -e "  2. 服务器防火墙是否允许80端口"
echo -e "  3. 查看容器日志：docker-compose logs"
echo -e "  4. 检查容器状态：docker-compose ps"

echo ""
