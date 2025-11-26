# AI时间管理系统 - 完整项目

## 项目概述

这是一个移动端优先的AI时间管理全栈应用，包含：
- **前端**：React + TypeScript + Vite + Ant Design
- **后端**：Python + FastAPI + MySQL
- **管理后台**：支持AI模型配置、用户管理、运营数据统计

## 项目结构

```
/
├── backend/                 # 后端服务
│   ├── main.py             # FastAPI主应用
│   ├── database.py         # 数据库配置
│   ├── models.py           # 数据模型
│   ├── routers/            # API路由
│   │   ├── auth.py         # 用户认证
│   │   ├── tasks.py        # 任务管理
│   │   ├── insights.py     # AI洞察
│   │   ├── goals.py        # 目标管理
│   │   ├── habits.py       # 习惯追踪
│   │   ├── admin.py        # 管理后台
│   │   └── ai_config.py    # AI配置
│   ├── requirements.txt    # Python依赖
│   ├── Dockerfile          # Docker配置
│   └── .env.example        # 环境变量示例
│
├── src/                    # 前端源代码
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── services/          # API服务
│   ├── store/             # 状态管理
│   └── types/             # TypeScript类型
│
├── static/                # 前端构建产物（部署时）
├── package.json           # 前端依赖
└── vite.config.ts         # Vite配置
```

## 快速开始

### 1. 数据库准备

创建MySQL数据库（数据库名必须是 `s2x3sgo2`）：

```sql
CREATE DATABASE s2x3sgo2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接信息

# 启动服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端API将运行在 `http://localhost:8000`

API文档：`http://localhost:8000/docs`

### 3. 前端开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 `http://localhost:3000`

### 4. 前端构建（生产环境）

```bash
# 构建前端
npm run build

# 将构建产物复制到 backend/static
cp -r dist/* backend/static/
```

### 5. Docker部署（推荐）

```bash
cd backend

# 构建Docker镜像
docker build -t ai-time-management .

# 运行容器
docker run -d \
  -p 8000:8000 \
  -e DATABASE_HOST=your_db_host \
  -e DATABASE_PORT=3306 \
  -e DATABASE_NAME=s2x3sgo2 \
  -e DATABASE_USER=your_user \
  -e DATABASE_PASSWORD=your_password \
  -e JWT_SECRET_KEY=your_secret_key \
  --name ai-time-management \
  ai-time-management
```

## 环境变量说明

### 必需配置

- `DATABASE_HOST`: 数据库主机地址
- `DATABASE_PORT`: 数据库端口（默认3306）
- `DATABASE_NAME`: 数据库名称（必须是s2x3sgo2）
- `DATABASE_USER`: 数据库用户名
- `DATABASE_PASSWORD`: 数据库密码
- `JWT_SECRET_KEY`: JWT密钥（用于用户认证）

### 可选配置

- `ENCRYPTION_KEY`: API密钥加密密钥
- `OPENAI_API_KEY`: OpenAI API密钥
- `DEEPSEEK_API_KEY`: DeepSeek API密钥

## API端点

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 任务管理
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/{id}` - 更新任务
- `DELETE /api/tasks/{id}` - 删除任务

### AI洞察
- `GET /api/insights` - 获取洞察列表
- `POST /api/insights` - 创建洞察
- `PUT /api/insights/{id}/read` - 标记为已读

### 管理后台
- `GET /api/admin/stats` - 获取运营数据
- `GET /api/admin/users` - 获取用户列表

### AI配置
- `GET /api/ai-config` - 获取AI配置列表
- `POST /api/ai-config` - 创建AI配置
- `GET /api/ai-config/active` - 获取当前激活的AI配置

## 功能特性

### 已实现
✅ 用户认证系统（JWT）
✅ 任务管理CRUD
✅ AI洞察管理
✅ 目标和习惯追踪
✅ 管理后台基础功能
✅ AI模型配置管理
✅ 数据库设计和ORM
✅ RESTful API设计

### 待实现
⏳ AI模型实际集成（OpenAI/DeepSeek）
⏳ 语音识别后端处理
⏳ 数据同步和离线支持
⏳ 支付系统集成
⏳ 移动端PWA优化
⏳ 推送通知

## 技术栈

### 后端
- **框架**: FastAPI 0.104+
- **数据库**: MySQL 8.0+
- **ORM**: SQLAlchemy
- **认证**: JWT + bcrypt
- **部署**: Docker + Uvicorn

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite 5
- **UI**: Ant Design 5 + Tailwind CSS
- **状态**: Zustand
- **路由**: React Router 6

## 开发指南

### 添加新的API端点

1. 在 `backend/routers/` 创建新的路由文件
2. 在 `backend/main.py` 中注册路由
3. 在 `backend/models.py` 中添加数据模型（如需要）

### 添加新的前端页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/components/Layout.tsx` 中添加菜单项

## 安全注意事项

1. **生产环境必须修改**：
   - `JWT_SECRET_KEY`
   - `ENCRYPTION_KEY`
   - 数据库密码

2. **CORS配置**：生产环境应指定具体的允许域名

3. **API密钥加密**：AI服务商的API密钥已加密存储

4. **管理后台认证**：当前为简化版本，生产环境需要完整的管理员认证系统

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue或联系开发团队。
