# 🚀 快速部署 - 3步完成

## 服务器信息
- **IP地址**: 43.134.233.165
- **访问端口**: 80 (HTTP)
- **SSH用户**: root

---

## 📝 部署步骤

### 第1步：准备部署脚本
```bash
chmod +x deploy-with-nginx.sh
```

### 第2步：执行一键部署
```bash
./deploy-with-nginx.sh
```

脚本将自动完成：
- ✅ 打包项目
- ✅ 上传到服务器
- ✅ 构建Docker镜像
- ✅ 启动Nginx和应用
- ✅ 配置防火墙

### 第3步：配置数据库（重要！）
```bash
# SSH登录服务器
ssh root@43.134.233.165

# 编辑配置文件
cd /opt/ai-time-management
nano backend/.env
# 或使用 vi: vi backend/.env

# 修改数据库配置：
# DATABASE_HOST=你的MySQL地址
# DATABASE_PASSWORD=你的数据库密码

# 重启服务
docker-compose restart
```

---

## 🌐 访问应用

部署完成后访问：
- **主页**: http://43.134.233.165/
- **API文档**: http://43.134.233.165/docs

### 默认登录账号
```
邮箱: admin@admin.com
密码: admin123456
```
⚠️ 登录后请立即修改密码！

---

## 📦 使用SQLite（无需配置MySQL）

如果你想快速测试，可以使用SQLite：

```bash
# SSH到服务器
ssh root@43.134.233.165
cd /opt/ai-time-management

# 编辑配置
nano backend/.env

# 修改或添加这一行
DATABASE_TYPE=sqlite

# 重启
docker-compose restart
```

---

## 🔍 常用命令

### 查看服务状态
```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose ps'
```

### 查看日志
```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose logs -f'
```

### 重启服务
```bash
ssh root@43.134.233.165 'cd /opt/ai-time-management && docker-compose restart'
```

---

## ⚠️ 故障排查

### 无法访问（最常见）

1. **检查云服务器安全组**
   - 登录云服务器控制台
   - 安全组中开放 **80端口**
   - 允许来源：0.0.0.0/0

2. **检查防火墙**
   ```bash
   # Ubuntu
   sudo ufw allow 80/tcp

   # CentOS
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --reload
   ```

3. **查看容器状态**
   ```bash
   ssh root@43.134.233.165 'docker ps'
   ```

### 数据库连接失败

使用SQLite（最简单）：
```bash
ssh root@43.134.233.165
cd /opt/ai-time-management
echo "DATABASE_TYPE=sqlite" >> backend/.env
docker-compose restart
```

---

## 📱 完整文档

详细文档请查看：
- **完整部署指南**: `SERVER_DEPLOYMENT.md`
- **项目文档**: `START_HERE.md`

---

## 🎉 就这么简单！

3步完成部署，立即开始使用你的AI时间管理系统！
