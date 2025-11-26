#!/bin/bash

# AI时间管理系统 - 一键部署脚本
# 服务器信息
SERVER_IP="43.134.233.165"
SERVER_USER="root"  # 根据你的服务器用户修改
DEPLOY_PATH="/opt/ai-time-management"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}AI时间管理系统 - Docker部署脚本${NC}"
echo -e "${BLUE}==================================${NC}"

# 1. 检查必要文件
echo -e "\n${GREEN}[1/6]${NC} 检查部署文件..."
if [ ! -d "backend/static" ]; then
    echo -e "${RED}错误: 未找到frontend构建文件，请先运行 npm run build${NC}"
    exit 1
fi

if [ ! -f "backend/Dockerfile" ]; then
    echo -e "${RED}错误: 未找到Dockerfile${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 文件检查完成"

# 2. 打包项目文件
echo -e "\n${GREEN}[2/6]${NC} 打包项目文件..."
tar -czf ai-time-management.tar.gz \
    backend/ \
    --exclude="backend/__pycache__" \
    --exclude="backend/venv" \
    --exclude="backend/*.db" \
    --exclude="backend/.env"

echo -e "${GREEN}✓${NC} 打包完成: ai-time-management.tar.gz"

# 3. 上传到服务器
echo -e "\n${GREEN}[3/6]${NC} 上传文件到服务器..."
scp ai-time-management.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 文件上传失败，请检查SSH连接${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 文件上传完成"

# 4. 在服务器上执行部署
echo -e "\n${GREEN}[4/6]${NC} 在服务器上部署应用..."

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
# 设置颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 创建部署目录
echo -e "${BLUE}创建部署目录...${NC}"
mkdir -p /opt/ai-time-management
cd /opt/ai-time-management

# 解压文件
echo -e "${BLUE}解压应用文件...${NC}"
tar -xzf /tmp/ai-time-management.tar.gz
rm /tmp/ai-time-management.tar.gz

# 创建.env文件（如果不存在）
if [ ! -f backend/.env ]; then
    echo -e "${BLUE}创建环境配置文件...${NC}"
    cat > backend/.env << 'EOF'
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=s2x3sgo2
DATABASE_USER=ai_time_user
DATABASE_PASSWORD=请修改为你的数据库密码

# JWT配置（请务必修改为随机字符串）
JWT_SECRET_KEY=请修改为随机密钥-使用python生成
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# 加密密钥（用于加密API密钥，请务必修改）
ENCRYPTION_KEY=请修改为随机密钥-使用python生成

# AI服务配置（可选，也可以通过管理后台配置）
# OPENAI_API_KEY=your-openai-key
# DEEPSEEK_API_KEY=your-deepseek-key
EOF
    echo -e "${RED}⚠️  请编辑 /opt/ai-time-management/backend/.env 文件，修改数据库密码和密钥！${NC}"
fi

# 停止旧容器
echo -e "${BLUE}停止旧容器...${NC}"
if [ "$(docker ps -a -q -f name=ai-time-management)" ]; then
    docker stop ai-time-management
    docker rm ai-time-management
fi

# 删除旧镜像
if [ "$(docker images -q ai-time-management:latest)" ]; then
    docker rmi ai-time-management:latest
fi

# 构建Docker镜像
echo -e "${BLUE}构建Docker镜像...${NC}"
cd backend
docker build -t ai-time-management:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: Docker镜像构建失败${NC}"
    exit 1
fi

# 启动容器
echo -e "${BLUE}启动Docker容器...${NC}"
docker run -d \
    --name ai-time-management \
    -p 8000:8000 \
    --env-file .env \
    --restart unless-stopped \
    ai-time-management:latest

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 容器启动失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 容器启动成功"

# 等待服务启动
echo -e "${BLUE}等待服务启动...${NC}"
sleep 5

# 检查服务状态
if docker ps | grep -q ai-time-management; then
    echo -e "${GREEN}✓${NC} 服务运行正常"
else
    echo -e "${RED}错误: 服务启动失败，查看日志：docker logs ai-time-management${NC}"
    exit 1
fi

ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}部署失败${NC}"
    exit 1
fi

# 5. 清理本地临时文件
echo -e "\n${GREEN}[5/6]${NC} 清理临时文件..."
rm ai-time-management.tar.gz
echo -e "${GREEN}✓${NC} 清理完成"

# 6. 验证部署
echo -e "\n${GREEN}[6/6]${NC} 验证部署..."
sleep 3

# 测试健康检查接口
HEALTH_CHECK=$(curl -s http://${SERVER_IP}:8000/api/health)
if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} 健康检查通过"
else
    echo -e "${RED}警告: 健康检查失败，请手动检查${NC}"
fi

# 完成
echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "\n访问地址："
echo -e "  前端应用: ${BLUE}http://${SERVER_IP}:8000/${NC}"
echo -e "  API文档:  ${BLUE}http://${SERVER_IP}:8000/docs${NC}"
echo -e "  健康检查: ${BLUE}http://${SERVER_IP}:8000/api/health${NC}"
echo -e "\n查看日志："
echo -e "  ${BLUE}ssh ${SERVER_USER}@${SERVER_IP} 'docker logs -f ai-time-management'${NC}"
echo -e "\n${RED}重要提示：${NC}"
echo -e "  1. 请立即修改服务器上的 /opt/ai-time-management/backend/.env 文件"
echo -e "  2. 修改数据库密码和JWT密钥"
echo -e "  3. 修改后重启容器：docker restart ai-time-management"
echo -e "  4. 配置防火墙允许8000端口访问"
echo ""
