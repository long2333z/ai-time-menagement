# 前后端集成实施计划

## 任务清单

- [ ] 1. 创建API客户端服务层
  - 创建统一的HTTP客户端封装,支持请求拦截、响应处理、错误处理
  - 实现JWT token自动注入和刷新机制
  - 创建API基础URL配置,支持开发/生产环境切换
  - 实现请求重试和超时处理
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 9.1, 9.2, 9.3_

- [ ] 2. 实现用户认证功能
  - 创建登录/注册页面组件
  - 实现用户注册API调用和表单验证
  - 实现用户登录API调用和JWT token存储
  - 创建受保护路由组件,未登录用户自动跳转登录页
  - 实现token过期检测和自动刷新逻辑
  - 实现退出登录功能,清除本地token和用户数据
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. 集成任务管理API
  - 修改任务创建功能,调用后端API保存任务
  - 实现任务列表从后端API加载
  - 实现任务更新功能,同步到后端
  - 实现任务删除功能,同步到后端
  - 实现任务状态切换,实时同步到后端
  - 添加离线模式支持,网络断开时保存到本地队列
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 4. 集成AI聊天功能
  - 修改AI聊天页面,优先从后端获取AI配置
  - 实现对话历史保存到后端数据库
  - 实现对话历史从后端加载
  - 添加AI调用失败时的降级逻辑(使用本地配置)
  - 实现AI调用错误日志记录到后端
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [ ] 5. 集成洞察功能
  - 修改洞察生成逻辑,保存到后端数据库
  - 实现洞察列表从后端API加载
  - 实现洞察标记已读功能,同步到后端
  - 实现洞察收藏功能,同步到后端
  - 实现洞察删除功能,同步到后端
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. 集成目标和习惯追踪
  - 修改目标创建功能,调用后端API保存
  - 实现目标列表从后端加载
  - 实现目标进度更新,同步到后端
  - 修改习惯记录功能,保存到后端
  - 实现习惯统计从后端计算和返回
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 7. 实现数据同步机制
  - 创建网络状态监听服务,检测在线/离线状态
  - 实现离线操作队列,存储待同步的操作
  - 实现网络恢复时的自动同步逻辑
  - 实现同步冲突检测和解决策略
  - 添加同步状态UI提示(同步中、同步成功、同步失败)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8. 完善错误处理和日志
  - 创建统一的错误处理中间件
  - 实现API错误的友好提示UI
  - 实现前端错误日志收集和上报到后端
  - 添加请求/响应日志记录(开发环境)
  - 实现错误重试机制和用户手动重试按钮
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 1.5_

- [ ] 9. 优化用户体验
  - 添加API调用加载状态指示器
  - 实现数据缓存,减少重复API调用
  - 添加乐观更新,提升操作响应速度
  - 实现数据分页加载,优化大数据量场景
  - 添加下拉刷新和上拉加载更多功能
  - _Requirements: 1.3, 技术考虑-性能优化_

- [ ] 10. 测试和文档
  - 测试用户注册和登录流程
  - 测试任务、目标、习惯的CRUD操作
  - 测试离线模式和数据同步
  - 测试AI聊天功能的后端集成
  - 编写前后端集成使用文档
  - 编写API调用示例和最佳实践文档
  - _Requirements: Success Criteria 1-8_

## 实施顺序说明

1. **第1-2步**是基础设施,必须首先完成
2. **第3步**是核心功能,优先级最高
3. **第4-6步**可以并行开发
4. **第7-8步**是增强功能,依赖前面的步骤
5. **第9步**是优化,可以在功能完成后逐步实施
6. **第10步**贯穿整个开发过程

## 技术实现要点

### API客户端封装示例
```typescript
// src/services/apiClient.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
})

// 请求拦截器 - 自动添加token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期,跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 离线队列实现示例
```typescript
// src/services/syncQueue.ts
interface QueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: 'task' | 'goal' | 'habit'
  data: any
  timestamp: number
}

class SyncQueue {
  private queue: QueueItem[] = []
  
  add(item: Omit<QueueItem, 'id' | 'timestamp'>) {
    this.queue.push({
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    })
    this.save()
  }
  
  async sync() {
    // 按时间顺序同步队列中的操作
    for (const item of this.queue) {
      await this.syncItem(item)
    }
  }
}
```

### 受保护路由示例
```typescript
// src/components/ProtectedRoute.tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}
```

## 环境配置

### 前端环境变量 (.env)
```env
# 开发环境
VITE_API_URL=http://localhost:8000/api
VITE_ENV=development

# 生产环境
# VITE_API_URL=https://api.example.com/api
# VITE_ENV=production
```

### 后端CORS配置
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 数据模型映射

确保前后端数据模型一致:

### Task模型
- 前端: `src/types/index.ts` - Task接口
- 后端: `backend/models.py` - Task类
- API: `backend/routers/tasks.py` - TaskResponse

### 关键字段映射
- 前端使用驼峰命名: `startTime`, `endTime`
- 后端使用下划线命名: `start_time`, `end_time`
- 需要在API层进行转换

## 测试检查清单

- [ ] 用户可以注册新账号
- [ ] 用户可以登录已有账号
- [ ] Token过期后自动跳转登录页
- [ ] 任务创建后保存到后端数据库
- [ ] 任务在不同设备间同步
- [ ] 离线模式下可以创建任务
- [ ] 网络恢复后自动同步离线数据
- [ ] AI聊天使用后端配置的API
- [ ] 洞察保存到后端并可查看历史
- [ ] 目标和习惯数据持久化存储
- [ ] API错误有友好的提示信息
- [ ] 加载状态有明确的UI指示

## 注意事项

1. **向后兼容**: 保持localStorage模式作为降级方案
2. **渐进式迁移**: 先完成核心功能,再逐步迁移其他功能
3. **错误处理**: 所有API调用都要有try-catch和错误提示
4. **性能优化**: 使用防抖节流,避免频繁API调用
5. **安全性**: 敏感数据不要存储在localStorage,使用httpOnly cookie
6. **用户体验**: 添加加载动画,乐观更新,离线提示等

## 完成标准

- ✅ 所有API调用都通过统一的客户端
- ✅ 用户认证流程完整且安全
- ✅ 核心数据(任务、目标、习惯)持久化到后端
- ✅ 离线模式正常工作
- ✅ 数据同步机制稳定可靠
- ✅ 错误处理完善,用户体验良好
- ✅ 代码有适当的注释和文档
- ✅ 通过所有测试检查清单
