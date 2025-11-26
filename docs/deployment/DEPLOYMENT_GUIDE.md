# AI时间管理系统 - 部署指南

## 🎯 项目概述

这是一个**移动端优先**的AI时间管理全栈应用，已完成以下核心功能：

### ✅ 已实现功能

#### 后端服务 (Python + FastAPI)
- ✅ 完整的RESTful API架构
- ✅ 用户认证系统（JWT + bcrypt）
- ✅ 任务管理CRUD接口
- ✅ AI洞察管理接口
- ✅ 目标和习惯追踪接口
- ✅ 管理后台API（用户管理、运营数据统计）
- ✅ AI模型配置管理（支持多AI服务商）
- ✅ 数据库设计和ORM（SQLAlchemy）
- ✅ API密钥加密存储
- ✅ Docker部署支持

#### 前端应用 (React + TypeScript)
- ✅ 移动端优先的响应式设计
- ✅ 底部导航栏（移动端）
- ✅ 侧边抽屉菜单（移动端）
- ✅ 大按钮和卡片式设计
- ✅ 语音输入组件（Web Speech API）
- ✅ AI任务解析（中文自然语言）
- ✅ 任务时间轴可视化
- ✅ 数据持久化（localStorage）
- ✅ 状态管理（Zustand）
- ✅ 完整的页面路由

## 📱 移动端优化特性

1. **底部导航栏** - 移动端显示5个主要功能入口
2. **大按钮设计** - 所有主要操作按钮高度≥48px，易于点击
3. **响应式布局** - 自动适配手机、平板、桌面
4. **触摸友好** - 卡片间距、按钮大小都针对触摸优化
5. **简化信息** - 移动端显示精简内容，桌面端显示完整信息

## 🚀 快速开始

### 方式一：本地开发（推荐用于测试）

#### 1. 前端开发服务器

```bash
# 安装依赖
npm install

# 启动开发服务器（支持热更新）
npm run dev
```

前端将运行在 `http://localhost:3000`

**注意**：前端开发模式下，数据存储在浏览器localStorage中，无需后端服务。

#### 2. 后端开发服务器（可选）

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

### 方式二：生产环境部署（Docker）

#### 1. 准备数据库

```sql
-- 创建数据库（数据库名必须是 s2x3sgo2）
CREATE DATABASE s2x3sgo2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'ai_time_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON s2x3sgo2.* TO 'ai_time_user'@'%';
FLUSH PRIVILEGES;
```

#### 2. 构建前端

```bash
# 构建前端生产版本
npm run build

# 将构建产物复制到后端static目录
mkdir -p backend/static
cp -r dist/* backend/static/
```

#### 3. 构建并运行Docker容器

```bash
cd backend

# 构建Docker镜像
docker build -t ai-time-management:latest .

# 运行容器
docker run -d \
  --name ai-time-management \
  -p 8000:8000 \
  -e DATABASE_HOST=your_db_host \
  -e DATABASE_PORT=3306 \
  -e DATABASE_NAME=s2x3sgo2 \
  -e DATABASE_USER=ai_time_user \
  -e DATABASE_PASSWORD=your_secure_password \
  -e JWT_SECRET_KEY=your-jwt-secret-key-change-this \
  -e ENCRYPTION_KEY=your-encryption-key-change-this \
  --restart unless-stopped \
  ai-time-management:latest
```

#### 4. 访问应用

- **前端应用**：`http://your-server:8000/static/`
- **API文档**：`http://your-server:8000/docs`
- **健康检查**：`http://your-server:8000/api/health`

## 🔧 环境变量配置

### 必需配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_HOST` | 数据库主机地址 | `localhost` 或 `your-db-host` |
| `DATABASE_PORT` | 数据库端口 | `3306` |
| `DATABASE_NAME` | 数据库名称 | `s2x3sgo2`（必须） |
| `DATABASE_USER` | 数据库用户名 | `ai_time_user` |
| `DATABASE_PASSWORD` | 数据库密码 | `your_secure_password` |
| `JWT_SECRET_KEY` | JWT密钥 | 随机生成的长字符串 |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `JWT_ALGORITHM` | JWT算法 | `HS256` |
| `JWT_EXPIRATION_HOURS` | Token过期时间（小时） | `24` |
| `ENCRYPTION_KEY` | API密钥加密密钥 | 自动生成 |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | - |

## 📊 API端点说明

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/me` - 更新用户信息

### 任务管理
- `GET /api/tasks` - 获取任务列表（支持筛选）
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/{id}` - 获取任务详情
- `PUT /api/tasks/{id}` - 更新任务
- `DELETE /api/tasks/{id}` - 删除任务
- `POST /api/tasks/batch` - 批量创建任务

### AI洞察
- `GET /api/insights` - 获取洞察列表
- `POST /api/insights` - 创建洞察
- `PUT /api/insights/{id}/read` - 标记为已读
- `PUT /api/insights/{id}/favorite` - 收藏/取消收藏

### 目标管理
- `GET /api/goals` - 获取目标列表
- `POST /api/goals` - 创建目标

### 习惯追踪
- `GET /api/habits` - 获取习惯列表
- `POST /api/habits` - 创建习惯

### 管理后台
- `GET /api/admin/stats` - 获取运营数据统计
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/users/{id}` - 获取用户详情

### AI配置
- `GET /api/ai-config` - 获取AI配置列表
- `POST /api/ai-config` - 创建AI配置
- `PUT /api/ai-config/{id}/toggle` - 启用/禁用配置
- `GET /api/ai-config/active` - 获取当前激活的配置
- `POST /api/ai-config/test` - 测试AI配置

## 📱 移动端使用指南

### 首次使用

1. **打开应用** - 在手机浏览器中访问应用地址
2. **查看演示数据** - 应用会自动加载演示数据
3. **开始规划** - 点击底部导航栏的"早晨计划"

### 语音规划

1. 点击"开始语音规划"按钮
2. 允许浏览器访问麦克风
3. 说出您的计划，例如：
   - "早上9点开会"
   - "10点到11点半做产品设计评审"
   - "下午2点重要的客户沟通"
4. AI会自动解析并创建任务

### 任务管理

- **查看任务** - 在时间轴上查看所有任务
- **切换状态** - 点击任务前的图标切换状态
- **编辑任务** - 点击编辑按钮修改任务
- **删除任务** - 点击删除按钮移除任务

## 🔒 安全注意事项

### 生产环境必须修改

1. **JWT密钥** - 使用强随机字符串
   ```bash
   # 生成随机密钥
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **加密密钥** - 用于加密AI API密钥
   ```bash
   # 生成Fernet密钥
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

3. **数据库密码** - 使用强密码

4. **CORS配置** - 在`backend/main.py`中指定具体的允许域名

### API密钥管理

- AI服务商的API密钥通过管理后台配置
- 密钥在数据库中加密存储
- 仅管理员可以查看和修改

## 🐛 故障排除

### 前端无法连接后端

1. 检查后端服务是否运行：`curl http://localhost:8000/api/health`
2. 检查CORS配置是否正确
3. 查看浏览器控制台错误信息

### 数据库连接失败

1. 检查数据库是否运行
2. 验证环境变量配置是否正确
3. 检查数据库用户权限
4. 查看后端日志：`docker logs ai-time-management`

### 语音识别不工作

1. 确保使用HTTPS或localhost
2. 检查浏览器是否支持Web Speech API
3. 允许浏览器访问麦克风权限
4. 尝试使用Chrome浏览器

### Docker容器无法启动

1. 检查端口是否被占用：`lsof -i :8000`
2. 查看容器日志：`docker logs ai-time-management`
3. 验证环境变量是否正确传递

## 📈 性能优化建议

### 前端优化

1. **代码分割** - 已通过Vite自动实现
2. **图片优化** - 使用WebP格式
3. **缓存策略** - 配置Service Worker（PWA）
4. **懒加载** - 路由级别的懒加载

### 后端优化

1. **数据库索引** - 已在模型中定义
2. **连接池** - SQLAlchemy自动管理
3. **缓存** - 可添加Redis缓存
4. **负载均衡** - 使用Nginx反向代理

## 🎨 自定义配置

### 修改主题颜色

编辑 `tailwind.config.js`：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 修改为您的品牌色
        500: '#your-color',
        600: '#your-color',
      },
    },
  },
}
```

### 修改应用名称

1. 编辑 `index.html` - 修改`<title>`标签
2. 编辑 `src/components/Layout.tsx` - 修改应用名称
3. 编辑 `backend/main.py` - 修改API标题

## 📞 技术支持

如有问题，请：

1. 查看API文档：`http://your-server:8000/docs`
2. 检查日志文件
3. 提交Issue到项目仓库

## 📄 许可证

MIT License

---

**祝您使用愉快！🎉**
