# 🚀 AI时间管理系统 - 立即开始

## ✨ 项目特点

- 📱 **移动端优先设计** - 完美适配手机、平板和桌面
- 🗄️ **零配置数据库** - 使用SQLite内置数据库，开箱即用
- 🎤 **语音输入** - 2分钟语音规划你的一天
- 🤖 **AI智能解析** - 自动识别任务、时间和优先级
- 📊 **数据可视化** - 直观的时间轴和统计图表
- 🔐 **用户认证** - JWT token安全认证
- 🎨 **现代UI** - Ant Design + Tailwind CSS

---

## 🎯 最快启动方式（3步）

### 1️⃣ 安装依赖

```bash
# 安装后端依赖
cd backend
pip install -r requirements.txt

# 安装前端依赖
cd ..
npm install
```

### 2️⃣ 启动后端

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ 后端会自动：
- 创建 `backend/data/ai_time_management.db` 数据库文件
- 初始化所有数据表
- 启动API服务在 http://localhost:8000

📚 API文档：http://localhost:8000/docs

### 3️⃣ 启动前端（新终端）

```bash
npm run dev
```

✅ 前端运行在：http://localhost:3000

---

## 📱 功能演示

### 🌅 早晨计划
1. 点击"开始语音规划"按钮
2. 允许浏览器访问麦克风
3. 说出你的计划，例如：
   ```
   早上9点开会，10点到11点半做产品设计评审，
   下午2点处理邮件，3点到5点写代码，重要任务
   ```
4. AI会自动解析并创建任务

### 📊 数据分析
- 查看任务完成率
- 时间分配统计
- 生产力趋势

### 🎯 目标习惯
- 设置长期目标
- 追踪每日习惯
- 查看进度和连续天数

### 💡 AI洞察
- 获取个性化建议
- 时间管理优化
- 工作生活平衡提示

---

## 🔧 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI库**: Ant Design
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router v6
- **日期处理**: date-fns

### 后端
- **框架**: FastAPI
- **数据库**: SQLite (默认) / MySQL (可选)
- **ORM**: SQLAlchemy
- **认证**: JWT + bcrypt
- **API文档**: Swagger UI

---

## 📦 生产部署

### 方式一：Docker部署（推荐）

```bash
# 1. 构建前端
npm run build

# 2. 复制到后端
mkdir -p backend/static
cp -r dist/* backend/static/

# 3. 构建Docker镜像
cd backend
docker build -t ai-time-management .

# 4. 运行容器
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET_KEY=your-production-secret-key \
  --name ai-time-management \
  ai-time-management
```

访问：http://localhost:8000/static/

### 方式二：直接部署

```bash
# 1. 构建前端
npm run build

# 2. 复制到后端
mkdir -p backend/static
cp -r dist/* backend/static/

# 3. 启动后端
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🔄 切换到MySQL（可选）

如果需要更高性能和并发支持：

### 1. 安装MySQL驱动
```bash
cd backend
pip install pymysql
```

### 2. 创建数据库
```sql
CREATE DATABASE s2x3sgo2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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

JWT_SECRET_KEY=your-secret-key
```

### 4. 重启后端
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📱 移动端使用

项目采用**移动端优先设计**：

- ✅ 响应式布局，自动适配屏幕尺寸
- ✅ 底部导航栏（移动端）
- ✅ 侧边抽屉菜单
- ✅ 触摸友好的大按钮
- ✅ 优化的字体和间距

直接在手机浏览器访问即可获得原生应用般的体验！

---

## 🎨 主要功能

### ✅ 已实现
- [x] 用户注册和登录
- [x] 语音输入和识别
- [x] AI任务解析（中文）
- [x] 任务时间轴展示
- [x] 任务状态管理
- [x] 数据持久化（SQLite）
- [x] 移动端优化
- [x] 响应式设计
- [x] API文档

### 🚧 待扩展
- [ ] 真实AI模型集成（OpenAI/DeepSeek）
- [ ] 日历同步（Google/Apple/Outlook）
- [ ] 数据分析图表
- [ ] 目标习惯追踪
- [ ] 邮件通知
- [ ] 支付集成

---

## 🔐 安全配置

### 生产环境必须修改：

1. **JWT密钥**
```env
JWT_SECRET_KEY=使用强随机字符串
```

2. **加密密钥**
```env
ENCRYPTION_KEY=使用Fernet生成的密钥
```

3. **CORS设置**
修改 `backend/main.py` 中的 `allow_origins`

---

## 📂 项目结构

```
ai-time-management/
├── backend/                 # 后端服务
│   ├── main.py             # FastAPI主程序
│   ├── database.py         # 数据库配置
│   ├── models.py           # 数据模型
│   ├── routers/            # API路由
│   │   ├── auth.py         # 认证
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
├── src/                    # 前端源码
│   ├── components/         # React组件
│   │   ├── Layout.tsx      # 布局组件
│   │   ├── VoiceInput.tsx  # 语音输入
│   │   └── TaskTimeline.tsx # 任务时间轴
│   ├── pages/              # 页面组件
│   │   ├── HomePage.tsx    # 首页
│   │   ├── PlanPage.tsx    # 计划页
│   │   ├── ReviewPage.tsx  # 复盘页
│   │   └── ...
│   ├── services/           # 业务逻辑
│   │   ├── aiParser.ts     # AI解析（英文）
│   │   └── aiParserCN.ts   # AI解析（中文）
│   ├── store/              # 状态管理
│   │   └── useAppStore.ts  # Zustand store
│   └── types/              # TypeScript类型
│
├── package.json            # 前端依赖
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # Tailwind配置
└── tsconfig.json           # TypeScript配置
```

---

## 🐛 故障排除

### 问题1：端口被占用
```bash
# 查找占用端口的进程
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# 或使用其他端口
uvicorn main:app --port 8001
```

### 问题2：数据库文件权限
```bash
chmod 755 backend/data
chmod 644 backend/data/ai_time_management.db
```

### 问题3：前端无法连接后端
检查 `src/services/` 中的API地址是否正确

### 问题4：语音输入不工作
- 确保使用HTTPS或localhost
- 检查浏览器麦克风权限
- 使用Chrome/Edge浏览器

---

## 📚 相关文档

- [快速开始指南](./QUICK_START.md) - 详细的安装和配置说明
- [部署指南](./DEPLOYMENT_GUIDE.md) - 生产环境部署
- [项目说明](./README_PROJECT.md) - 项目架构和设计
- [API文档](http://localhost:8000/docs) - 在线API文档

---

## 💡 使用建议

### 开发环境
- 使用 **SQLite** 数据库
- 前后端分离运行
- 启用热更新

### 个人使用
- 使用 **SQLite** 数据库
- Docker单容器部署
- 数据卷持久化

### 生产环境
- 使用 **MySQL** 数据库
- Docker + 外部MySQL
- 负载均衡 + 多实例
- HTTPS + 域名

---

## 🎉 开始使用

现在就开始体验AI时间管理系统吧！

```bash
# 1. 启动后端
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 2. 启动前端（新终端）
npm run dev

# 3. 打开浏览器
# http://localhost:3000
```

**祝您使用愉快！** 🚀

---

## 📞 获取帮助

- 查看 [QUICK_START.md](./QUICK_START.md) 了解详细配置
- 查看 [API文档](http://localhost:8000/docs) 了解接口详情
- 遇到问题？检查控制台日志

---

*由 [with](https://with.woa.com/) 通过自然语言生成*
