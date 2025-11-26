# AI时间管理系统 - 服务器部署指南

## 📋 部署概览

本指南将帮助你把应用部署到 **43.134.233.165** 服务器，使用 **Docker + Nginx** 方案，通过 **80端口** 对外提供服务。

### 部署架构

```
用户浏览器 (http://43.134.233.165)
    ↓
云服务器 80端口
    ↓
Nginx容器 (反向代理)
    ↓
应用容器 (8000端口)
    ├── FastAPI后端
    └── React前端静态文件
```

## 🚀 一键部署

### 前置条件

1. **本地环境**：
   - Git 已安装
   - npm 已安装
   - SSH访问权限（已配置公钥）

2. **服务器环境**（首次部署需要）：
   - Ubuntu 20.04+ / CentOS 7+
   - Docker 已安装
   - Docker Compose 已安装
   - 80端口已在防火墙和安全组开放

### 快速部署步骤

#### 1. 构建前端（本地执行）

```bash
# 已完成！dist文件夹已经构建好并复制到backend/static/
```

#### 2. 执行部署脚本

```bash
# 给脚本执行权限
chmod +x deploy-with-nginx.sh

# 执行部署
./deploy-with-nginx.sh
```

脚本会自动完成：
- ✅ 打包项目文件
- ✅ 上传到服务器
- ✅ 构建Docker镜像
- ✅ 启动Nginx和应用容器
- ✅ 配置防火墙规则
- ✅ 验证部署状态

#### 3. 配置数据库（重要！）

部署完成后，SSH登录服务器修改配置：

```bash
# SSH登录服务器
ssh root@43.134.233.165

# 编辑环境配置
cd /opt/ai-time-management
vi backend/.env
```

修改以下配置：

```env
# 数据库配置（必须修改）
DATABASE_TYPE=mysql
DATABASE_HOST=你的MySQL主机地址
DATABASE_PORT=3306
DATABASE_NAME=s2x3sgo2
DATABASE_USER=ai_time_user
DATABASE_PASSWORD=你的数据库密码

# JWT配置（已自动生成，可选修改）
JWT_SECRET_KEY=自动生成的随机密钥
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# 加密密钥（已自动生成）
ENCRYPTION_KEY=自动生成的密钥
```

修改后重启服务：

```bash
cd /opt/ai-time-management
docker-compose restart
```

#### 4. 初始化数据库（如果使用MySQL）

在MySQL中创建数据库：

```sql
-- 连接到MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE s2x3sgo2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'ai_time_user'@'%' IDENTIFIED BY '你的密码';
GRANT ALL PRIVILEGES ON s2x3sgo2.* TO 'ai_time_user'@'%';
FLUSH PRIVILEGES;
```

## 🌐 访问应用

部署完成后，可以通过以下地址访问：

- **前端应用**: http://43.134.233.165/
- **API文档**: http://43.134.233.165/docs
- **健康检查**: http://43.134.233.165/api/health

### 默认管理员账号

```
邮箱: admin@admin.com
密码: admin123456
```

⚠️ **首次登录后请立即修改密码！**

## 🔧 常用管理命令

### 查看服务状态

```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose ps'
```

### 查看实时日志

```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose logs -f'
```

### 重启服务

```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose restart'
```

### 停止服务

```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose stop'
```

### 启动服务

```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose start'
```

### 完全重新部署

```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose down && docker-compose up -d --build'
```

## 🔍 故障排查

### 1. 无法访问应用（80端口）

**检查云服务器安全组**：
- 登录云服务器控制台
- 找到安全组设置
- 确保开放了 `80/tcp` 端口
- 来源可以设置为 `0.0.0.0/0`（允许所有IP访问）

**检查服务器防火墙**：

```bash
# Ubuntu/Debian (ufw)
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

**检查Nginx容器**：

```bash
# 查看Nginx容器状态
docker ps | grep nginx

# 查看Nginx日志
docker logs ai-time-nginx

# 测试Nginx配置
docker exec ai-time-nginx nginx -t
```

### 2. API返回500错误

**查看应用日志**：

```bash
docker logs ai-time-management
```

**常见问题**：
- 数据库连接失败：检查 `.env` 文件中的数据库配置
- 数据库不存在：确认已创建 `s2x3sgo2` 数据库
- 权限问题：确认数据库用户有足够权限

### 3. 容器无法启动

**查看容器状态**：

```bash
cd /opt/ai-time-management
docker-compose ps
```

**查看完整日志**：

```bash
docker-compose logs
```

**重新构建镜像**：

```bash
docker-compose down
docker-compose up -d --build
```

### 4. 数据库连接失败

**使用SQLite（简单，适合测试）**：

编辑 `backend/.env`：

```env
# 不设置DATABASE_TYPE或设置为sqlite
DATABASE_TYPE=sqlite
DATABASE_PATH=/app/data/ai_time_management.db
```

**使用MySQL（推荐生产环境）**：

1. 确认MySQL服务运行
2. 确认数据库已创建
3. 测试连接：

```bash
mysql -h 主机地址 -u ai_time_user -p s2x3sgo2
```

## 📦 更新部署

当代码有更新时：

### 方式一：使用部署脚本（推荐）

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建前端
npm run build

# 3. 复制到backend
rm -rf backend/static
mkdir -p backend/static
cp -r dist/* backend/static/

# 4. 执行部署脚本
./deploy-with-nginx.sh
```

### 方式二：手动更新

```bash
# 1. SSH到服务器
ssh root@43.134.233.165

# 2. 进入部署目录
cd /opt/ai-time-management

# 3. 备份配置
cp backend/.env /tmp/.env.backup

# 4. 下载新代码（或通过scp上传）
# ... 上传新文件 ...

# 5. 恢复配置
cp /tmp/.env.backup backend/.env

# 6. 重新构建并启动
docker-compose down
docker-compose up -d --build
```

## 🔐 安全建议

### 1. 修改默认密码

登录应用后：
- 进入用户设置
- 修改管理员密码

### 2. 配置HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（需要有域名）
sudo certbot --nginx -d your-domain.com
```

### 3. 限制SSH访问

```bash
# 只允许特定IP访问SSH
sudo ufw allow from 你的IP地址 to any port 22
sudo ufw delete allow 22
```

### 4. 定期备份数据

```bash
# 备份数据库（SQLite）
docker exec ai-time-management tar -czf /tmp/backup.tar.gz /app/data
docker cp ai-time-management:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz

# 备份数据库（MySQL）
mysqldump -u ai_time_user -p s2x3sgo2 > backup-$(date +%Y%m%d).sql
```

## 📊 性能优化

### 1. 调整Docker资源限制

编辑 `docker-compose.yml`：

```yaml
services:
  app:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### 2. 配置Nginx缓存

编辑 `nginx.conf`，添加缓存配置。

### 3. 使用Redis缓存（可选）

在 `docker-compose.yml` 中添加Redis服务。

## 📞 技术支持

如遇问题：

1. 查看日志：`docker-compose logs`
2. 检查容器状态：`docker-compose ps`
3. 查看API文档：http://43.134.233.165/docs
4. 提交Issue到GitHub仓库

## 🎉 完成

恭喜！你已经成功部署了AI时间管理系统。

现在你可以：
- ✅ 通过 http://43.134.233.165 访问应用
- ✅ 使用管理员账号登录
- ✅ 开始使用AI时间管理功能
- ✅ 通过API文档了解接口详情

祝使用愉快！
