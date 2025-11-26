# 前后端集成指南

## 📋 已完成的工作

### 1. ✅ API客户端服务层
已创建统一的HTTP客户端封装 (`/src/services/apiClient.ts`):
- ✅ Axios实例配置
- ✅ 请求拦截器(自动添加JWT token)
- ✅ 响应拦截器(统一错误处理)
- ✅ Token管理(存储、获取、删除、过期检测)
- ✅ 自动重试机制(最多3次)
- ✅ 网络状态监听
- ✅ 401自动跳转登录

### 2. ✅ 认证服务API
已创建认证服务 (`/src/services/authService.ts`):
- ✅ 用户注册接口
- ✅ 用户登录接口
- ✅ 退出登录功能
- ✅ 获取当前用户信息
- ✅ 更新用户信息
- ✅ 登录状态检测
- ✅ 用户信息缓存

### 3. ✅ 任务管理服务API
已创建任务服务 (`/src/services/taskService.ts`):
- ✅ 获取任务列表
- ✅ 获取单个任务
- ✅ 创建任务
- ✅ 批量创建任务
- ✅ 更新任务
- ✅ 删除任务
- ✅ 切换任务状态
- ✅ 数据格式转换(前后端格式适配)

### 4. ✅ 洞察服务API
已创建洞察服务 (`/src/services/insightService.ts`):
- ✅ 获取洞察列表
- ✅ 获取未读洞察
- ✅ 获取收藏洞察
- ✅ 创建洞察
- ✅ 标记已读
- ✅ 切换收藏
- ✅ 批量操作
- ✅ 统计信息

### 5. ✅ 用户认证页面
已创建登录注册页面:
- ✅ 登录页面 (`/src/pages/LoginPage.tsx`)
- ✅ 注册页面 (`/src/pages/RegisterPage.tsx`)
- ✅ 受保护路由组件 (`/src/components/ProtectedRoute.tsx`)
- ✅ 路由配置更新 (`/src/App.tsx`)
- ✅ 表单验证
- ✅ 错误提示
- ✅ 加载状态

### 6. ✅ 依赖和配置
- ✅ 添加axios依赖到package.json
- ✅ 创建环境变量配置文件(.env.example)
- ✅ API基础URL配置

---

## 🚧 待完成的工作

### 1. 集成任务管理到Store
需要修改 `/src/store/useAppStore.ts`:
```typescript
// 将本地存储的任务操作改为调用API
import * as taskService from '../services/taskService'

// 示例:
addTask: async (task: Task) => {
  try {
    const newTask = await taskService.createTask(task)
    set(state => ({ tasks: [...state.tasks, newTask] }))
  } catch (error) {
    console.error('Add task failed:', error)
    // 离线模式: 保存到本地队列
  }
}
```

### 2. 集成洞察管理到Store
需要修改洞察相关的store方法调用后端API

### 3. 集成AI聊天功能
需要修改 `/src/pages/AIChatPage.tsx`:
- 从后端获取AI配置
- 保存对话历史到后端
- 加载历史对话

### 4. 集成目标和习惯
创建目标和习惯的服务API:
- `/src/services/goalService.ts`
- `/src/services/habitService.ts`

### 5. 实现离线模式
创建离线队列服务 (`/src/services/syncQueue.ts`):
```typescript
interface QueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: 'task' | 'goal' | 'habit' | 'insight'
  data: any
  timestamp: number
}

class SyncQueue {
  private queue: QueueItem[] = []
  
  add(item: Omit<QueueItem, 'id' | 'timestamp'>) {
    // 添加到队列
  }
  
  async sync() {
    // 同步队列中的操作
  }
}
```

### 6. 添加加载状态
在所有API调用处添加loading状态:
```typescript
const [loading, setLoading] = useState(false)

const handleAction = async () => {
  setLoading(true)
  try {
    await apiCall()
  } finally {
    setLoading(false)
  }
}
```

### 7. 实现数据缓存
使用React Query或SWR实现数据缓存和自动刷新

### 8. 添加错误边界
创建错误边界组件捕获React错误

---

## 🔧 使用指南

### 启动开发环境

#### 1. 安装依赖
```bash
npm install
```

#### 2. 配置环境变量
创建 `.env` 文件:
```env
VITE_API_URL=http://localhost:8000/api
VITE_ENV=development
```

#### 3. 启动后端
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 4. 启动前端
```bash
npm run dev
```

### API调用示例

#### 登录
```typescript
import { login } from './services/authService'

const handleLogin = async () => {
  try {
    const response = await login({
      email: 'user@example.com',
      password: 'password123'
    })
    console.log('Login success:', response)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

#### 创建任务
```typescript
import { createTask } from './services/taskService'

const handleCreateTask = async () => {
  try {
    const task = await createTask({
      title: '完成项目报告',
      description: '撰写Q4项目总结报告',
      priority: 'high',
      start_time: new Date().toISOString(),
      duration: 120
    })
    console.log('Task created:', task)
  } catch (error) {
    console.error('Create task failed:', error)
  }
}
```

#### 获取洞察列表
```typescript
import { getInsights } from './services/insightService'

const loadInsights = async () => {
  try {
    const insights = await getInsights({ is_read: false })
    console.log('Unread insights:', insights)
  } catch (error) {
    console.error('Load insights failed:', error)
  }
}
```

---

## 🔐 认证流程

### 1. 用户注册
```
用户填写注册表单 → 调用register API → 
后端创建用户 → 返回token → 
前端保存token → 跳转首页
```

### 2. 用户登录
```
用户填写登录表单 → 调用login API → 
后端验证用户 → 返回token → 
前端保存token → 跳转首页
```

### 3. 受保护路由
```
用户访问页面 → ProtectedRoute检查token → 
有token: 渲染页面 
无token: 跳转登录页
```

### 4. Token过期处理
```
API请求 → 拦截器检查token → 
token过期: 清除token + 跳转登录 
token有效: 添加到请求头
```

---

## 📊 数据流

### 前端 → 后端
```
用户操作 → 调用Service API → 
HTTP请求(带token) → 后端处理 → 
返回响应 → 更新前端状态
```

### 后端 → 前端
```
后端响应 → 响应拦截器 → 
错误处理/数据转换 → 
更新Store → 更新UI
```

### 离线模式
```
用户操作 → 检测网络 → 
离线: 保存到队列 + 更新本地状态
在线: 直接调用API
网络恢复: 同步队列中的操作
```

---

## 🐛 错误处理

### API错误
- 401: 自动跳转登录
- 403: 提示无权限
- 404: 提示资源不存在
- 500: 提示服务器错误
- 网络错误: 自动重试(最多3次)

### 用户友好提示
所有错误都会通过Ant Design的message组件显示:
```typescript
message.error('操作失败,请稍后重试')
message.success('操作成功')
message.warning('网络连接不稳定')
```

---

## 📝 最佳实践

### 1. 始终使用try-catch
```typescript
try {
  await apiCall()
} catch (error) {
  console.error('Error:', error)
  message.error('操作失败')
}
```

### 2. 添加加载状态
```typescript
const [loading, setLoading] = useState(false)
// 在API调用前后设置loading
```

### 3. 数据格式转换
前后端数据格式可能不同,使用转换函数:
```typescript
// 前端: startTime (Date)
// 后端: start_time (string ISO 8601)
```

### 4. 离线优先
先更新本地状态,再同步到后端:
```typescript
// 乐观更新
updateLocalState()
try {
  await syncToBackend()
} catch {
  rollbackLocalState()
}
```

### 5. 缓存用户信息
登录后缓存用户信息,减少API调用:
```typescript
localStorage.setItem('user_profile', JSON.stringify(user))
```

---

## 🚀 下一步

1. **完成Store集成**: 将所有本地操作改为调用API
2. **实现离线模式**: 创建同步队列和网络监听
3. **添加加载状态**: 所有API调用添加loading
4. **优化用户体验**: 乐观更新、数据缓存、分页加载
5. **完善错误处理**: 更详细的错误提示和重试机制
6. **编写测试**: 单元测试和集成测试
7. **性能优化**: 防抖节流、虚拟滚动、懒加载

---

## 📚 相关文档

- [API文档](http://localhost:8000/docs) - FastAPI自动生成的API文档
- [需求文档](./.with/frontend-backend-integration/requirements.md)
- [任务清单](./.with/frontend-backend-integration/task-item.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [快速开始](./QUICK_START.md)

---

**最后更新**: 2025-11-26  
**状态**: 基础架构已完成,待集成到各个页面
