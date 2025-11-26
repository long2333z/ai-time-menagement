#!/bin/bash

# AI时间管理系统 - 完整自动化部署脚本（包含Docker安装）
# 服务器信息
SERVER_IP="43.134.233.165"
SERVER_USER="root"
DEPLOY_PATH="/opt/ai-time-management"

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

# 2. 测试SSH连接
echo -e "\n${GREEN}[2/8]${NC} 测试SSH连接..."
ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} "echo '连接成功'" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: SSH连接失败${NC}"
    echo -e "${YELLOW}提示: 请检查SSH密钥是否已添加到ssh-agent${NC}"
    echo -e "${YELLOW}运行: ssh-add ~/.ssh/id_rsa${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} SSH连接正常"

# 3. 在服务器上安装Docker环境
echo -e "\n${GREEN}[3/8]${NC} 检查并安装Docker环境..."

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
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

    # 更新包管理器
    echo -e "${BLUE}[服务器] 更新包管理器...${NC}"
    apt-get update -qq

    # 安装必要的依赖
    echo -e "${BLUE}[服务器] 安装依赖包...${NC}"
    apt-get install -y -qq ca-certificates curl gnupg lsb-release

    # 添加Docker官方GPG密钥
    echo -e "${BLUE}[服务器] 添加Docker GPG密钥...${NC}"
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null || \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null

    # 设置Docker仓库
    echo -e "${BLUE}[服务器] 设置Docker仓库...${NC}"
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null 2>&1 || \
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null 2>&1

    # 更新包索引
    apt-get update -qq

    # 安装Docker Engine
    echo -e "${BLUE}[服务器] 安装Docker Engine...${NC}"
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # 启动Docker服务
    systemctl start docker
    systemctl enable docker

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

echo -e "${GREEN}✓${NC} 打包完成: ai-time-management-full.tar.gz"

# 5. 上传到服务器
echo -e "\n${GREEN}[5/8]${NC} 上传文件到服务器..."
scp ai-time-management-full.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 文件上传失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 文件上传完成"

# 6. 在服务器上部署应用
echo -e "\n${GREEN}[6/8]${NC} 在服务器上部署应用..."

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[服务器] 开始部署应用...${NC}"

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
    ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" 2>/dev/null || echo "需要安装cryptography库")

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
docker compose down 2>/dev/null || true

# 清理旧镜像
echo -e "${BLUE}[服务器] 清理旧镜像...${NC}"
docker image prune -f

# 启动服务
echo -e "${BLUE}[服务器] 启动服务（Docker Compose构建和启动）...${NC}"
docker compose up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 服务启动失败${NC}"
    echo -e "${YELLOW}查看日志: docker compose logs${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 服务启动成功"

# 等待服务启动
echo -e "${BLUE}[服务器] 等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "${BLUE}[服务器] 检查服务状态...${NC}"
docker compose ps

# 配置防火墙（如果使用ufw）
if command -v ufw &> /dev/null; then
    echo -e "${BLUE}[服务器] 配置防火墙...${NC}"
    ufw allow 80/tcp 2>/dev/null || true
    echo -e "${GREEN}✓${NC} 防火墙已配置（允许HTTP访问）"
fi

echo -e "${GREEN}[服务器] 应用部署完成！${NC}"

ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}应用部署失败${NC}"
    exit 1
fi

# 7. 清理本地临时文件
echo -e "\n${GREEN}[7/8]${NC} 清理临时文件..."
rm ai-time-management-full.tar.gz
echo -e "${GREEN}✓${NC} 清理完成"

# 8. 验证部署
echo -e "\n${GREEN}[8/8]${NC} 验证部署..."
sleep 5

# 测试80端口
echo -e "${BLUE}测试80端口访问...${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}/ 2>/dev/null || echo "000")
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "304" ]; then
    echo -e "${GREEN}✓${NC} 80端口访问正常"
else
    echo -e "${YELLOW}警告: 80端口访问异常 (HTTP ${HTTP_RESPONSE})${NC}"
    echo -e "${YELLOW}请检查云服务器安全组设置，确保开放80端口${NC}"
fi

# 测试API
echo -e "${BLUE}测试API接口...${NC}"
HEALTH_CHECK=$(curl -s http://${SERVER_IP}/api/health 2>/dev/null || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} API接口正常"
else
    echo -e "${YELLOW}警告: API接口响应异常${NC}"
    echo -e "${YELLOW}可能需要几分钟初始化，请稍后再试${NC}"
fi

# 完成
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}访问地址：${NC}"
echo -e "  前端应用: ${GREEN}http://${SERVER_IP}/${NC}"
echo -e "  API文档:  ${GREEN}http://${SERVER_IP}/docs${NC}"
echo -e "  健康检查: ${GREEN}http://${SERVER_IP}/api/health${NC}"

echo -e "\n${BLUE}管理命令：${NC}"
echo -e "  查看日志: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose logs -f'${NC}"
echo -e "  重启服务: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose restart'${NC}"
echo -e "  停止服务: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose stop'${NC}"
echo -e "  启动服务: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose start'${NC}"

echo -e "\n${RED}重要提示：${NC}"
echo -e "  ${YELLOW}1. 请SSH登录服务器编辑配置文件：${NC}"
echo -e "     ${BLUE}vim /opt/ai-time-management/backend/.env${NC}"
echo -e "  ${YELLOW}2. 修改数据库连接信息${NC}"
echo -e "  ${YELLOW}3. 修改后重启服务：${NC}"
echo -e "     ${BLUE}ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose restart'${NC}"
echo -e "  ${YELLOW}4. 确保云服务器安全组已开放80端口${NC}"
echo -e "  ${YELLOW}5. 默认管理员账号：${NC}"
echo -e "     用户名: ${BLUE}admin${NC}"
echo -e "     密码: ${BLUE}admin123${NC} ${RED}(首次登录后请立即修改！)${NC}"

echo -e "\n${BLUE}故障排查：${NC}"
echo -e "  如果无法访问，请检查："
echo -e "  1. 云服务器安全组是否开放80端口"
echo -e "  2. 运行: ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose ps'"
echo -e "  3. 查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/ai-time-management && docker compose logs'"

echo ""
