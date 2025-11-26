# AI时间管理系统 - 快速开始指南

## 🚀 最简单的方式（使用SQLite）

### 1. 安装依赖

```bash
# 后端依赖
cd backend
pip install -r requirements.txt

# 前端依赖
cd ..
npm install
```

### 2. 启动后端

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**就这么简单！** 后端会自动：
- 创建 `./data/ai_time_management.db` SQLite数据库文件
- 初始化所有数据表
- 启动API服务

后端运行在：`http://localhost:8000`  
API文档：`http://localhost:8000/docs`

### 3. 启动前端（开发模式）

```bash
npm run dev
```

前端运行在：`http://localhost:3000`

---

## 📊 使用MySQL数据库（可选）

如果您需要使用MySQL而不是SQLite：

### 1. 创建MySQL数据库

```sql
CREATE DATABASE s2x3sgo2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 安装MySQL驱动

```bash
cd backend
pip install pymysql
```

### 3. 配置环境变量

创建 `backend/.env` 文件：

```env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=s2x3sgo2
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password

JWT_SECRET_KEY=your-secret-key-change-this
```

### 4. 启动服务

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🐳 Docker部署（生产环境）

### 使用SQLite（推荐用于单机部署）

```bash
cd backend

# 构建镜像
docker build -t ai-time-management .

# 运行容器
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET_KEY=your-secret-key \
  --name ai-time-management \
  ai-time-management
```

### 使用MySQL（推荐用于生产环境）

```bash
docker run -d \
  -p 8000:8000 \
  -e DATABASE_TYPE=mysql \
  -e DATABASE_HOST=your_db_host \
  -e DATABASE_PORT=3306 \
  -e DATABASE_NAME=s2x3sgo2 \
  -e DATABASE_USER=your_user \
  -e DATABASE_PASSWORD=your_password \
  -e JWT_SECRET_KEY=your-secret-key \
  --name ai-time-management \
  ai-time-management
```

---

## 📦 完整部署（前端+后端）

### 1. 构建前端

```bash
npm run build
```

### 2. 复制到后端

```bash
mkdir -p backend/static
cp -r dist/* backend/static/
```

### 3. 启动后端

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

现在访问：`http://localhost:8000/static/` 即可使用完整应用！

---

## 🔧 常见问题

### Q: SQLite和MySQL有什么区别？

**SQLite（默认）**
- ✅ 零配置，开箱即用
- ✅ 单文件数据库，易于备份
- ✅ 适合个人使用或小团队
- ⚠️ 不支持高并发

**MySQL**
- ✅ 支持高并发
- ✅ 适合生产环境
- ✅ 更好的性能和扩展性
- ⚠️ 需要额外配置

### Q: 如何切换数据库？

只需修改环境变量 `DATABASE_TYPE`：
- `DATABASE_TYPE=sqlite` - 使用SQLite（默认）
- `DATABASE_TYPE=mysql` - 使用MySQL

### Q: 数据库文件在哪里？

SQLite数据库文件默认位置：`backend/data/ai_time_management.db`

可以通过环境变量修改：
```env
DATABASE_PATH=./my_custom_path/database.db
```

### Q: 如何备份数据？

**SQLite**：直接复制数据库文件
```bash
cp backend/data/ai_time_management.db backup/
```

**MySQL**：使用mysqldump
```bash
mysqldump -u username -p s2x3sgo2 > backup.sql
```

### Q: 如何重置数据库？

**SQLite**：删除数据库文件，重启服务会自动重建
```bash
rm backend/data/ai_time_management.db
```

**MySQL**：删除并重建数据库
```sql
DROP DATABASE s2x3sgo2;
CREATE DATABASE s2x3sgo2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🎯 推荐配置

### 开发环境
- 使用 **SQLite**
- 前后端分离运行
- 启用热更新

### 个人使用
- 使用 **SQLite**
- Docker单容器部署
- 数据卷持久化

### 生产环境
- 使用 **MySQL**
- Docker + 外部MySQL
- 负载均衡 + 多实例

---

## 📞 需要帮助？

- 查看完整文档：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 查看API文档：`http://localhost:8000/docs`
- 查看项目说明：[README_PROJECT.md](./README_PROJECT.md)

**祝您使用愉快！** 🎉
