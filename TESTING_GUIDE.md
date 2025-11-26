# 测试指南

## 📋 概述

本项目使用 **Vitest** 作为测试框架,为前后端集成的核心功能提供单元测试保障。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI界面
npm run test:ui

# 监听模式(开发时使用)
npm test -- --watch
```

## 📁 测试文件结构

```
src/
├── services/
│   ├── __tests__/
│   │   ├── apiClient.test.ts      # API客户端测试
│   │   ├── authService.test.ts    # 认证服务测试
│   │   └── taskService.test.ts    # 任务服务测试
│   ├── apiClient.ts
│   ├── authService.ts
│   └── taskService.ts
└── test/
    └── setup.ts                    # 测试环境配置
```

## ✅ 已实现的测试

### 1. API客户端测试 (`apiClient.test.ts`)

**测试覆盖:**
- ✅ Token存储和获取
- ✅ Token删除
- ✅ Token过期检测
- ✅ 自定义过期时间
- ✅ Token清理

**测试用例:**
```typescript
describe('API Client - Token Management', () => {
  it('should store token correctly')
  it('should remove token correctly')
  it('should not be expired immediately after setting')
  it('should be expired when expiry time has passed')
  it('should set custom expiry time')
})
```

### 2. 认证服务测试 (`authService.test.ts`)

**测试覆盖:**
- ✅ 登录状态检测
- ✅ 用户信息缓存
- ✅ 退出登录
- ✅ Token验证
- ✅ 数据清理

**测试用例:**
```typescript
describe('Auth Service', () => {
  it('should return false when no token exists')
  it('should return true when token exists')
  it('should return cached user when exists')
  it('should clear all auth-related data on logout')
})
```

## 📊 测试覆盖率

运行以下命令查看测试覆盖率:

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录下。

**当前覆盖率目标:**
- 语句覆盖率: > 80%
- 分支覆盖率: > 75%
- 函数覆盖率: > 80%
- 行覆盖率: > 80%

## 🔧 测试配置

### Vitest配置 (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### 测试环境设置 (`src/test/setup.ts`)

- 自动清理DOM
- Mock window.matchMedia
- Mock IntersectionObserver
- Mock ResizeObserver

## 📝 编写测试的最佳实践

### 1. 测试文件命名

```
<filename>.test.ts    # 单元测试
<filename>.spec.ts    # 集成测试
```

### 2. 测试结构

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Feature Name', () => {
  beforeEach(() => {
    // 每个测试前的准备工作
  })

  afterEach(() => {
    // 每个测试后的清理工作
  })

  describe('Sub Feature', () => {
    it('should do something', () => {
      // Arrange - 准备测试数据
      const input = 'test'
      
      // Act - 执行被测试的功能
      const result = someFunction(input)
      
      // Assert - 验证结果
      expect(result).toBe('expected')
    })
  })
})
```

### 3. 测试命名规范

使用清晰的描述性名称:

```typescript
// ✅ 好的命名
it('should return user when token is valid')
it('should throw error when email is invalid')
it('should update task status to completed')

// ❌ 不好的命名
it('test1')
it('works')
it('check function')
```

### 4. 测试隔离

每个测试应该独立,不依赖其他测试:

```typescript
describe('Task Service', () => {
  beforeEach(() => {
    // 每个测试前重置状态
    localStorage.clear()
  })

  it('test 1', () => {
    // 独立的测试
  })

  it('test 2', () => {
    // 不依赖test 1的结果
  })
})
```

### 5. Mock外部依赖

```typescript
import { vi } from 'vitest'

// Mock API调用
vi.mock('../services/apiClient', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any
```

## 🎯 测试策略

### 单元测试

测试单个函数或组件的功能:

```typescript
// 测试纯函数
it('should calculate total correctly', () => {
  expect(calculateTotal([1, 2, 3])).toBe(6)
})

// 测试异步函数
it('should fetch user data', async () => {
  const user = await fetchUser('123')
  expect(user.id).toBe('123')
})
```

### 集成测试

测试多个模块协同工作:

```typescript
it('should login and fetch user data', async () => {
  // 登录
  await login({ email: 'test@example.com', password: 'password' })
  
  // 验证token已保存
  expect(getToken()).toBeTruthy()
  
  // 获取用户信息
  const user = await getCurrentUser()
  expect(user.email).toBe('test@example.com')
})
```

## 🐛 调试测试

### 1. 使用测试UI

```bash
npm run test:ui
```

在浏览器中打开测试UI,可以:
- 查看测试结果
- 重新运行单个测试
- 查看测试覆盖率
- 调试失败的测试

### 2. 使用console.log

```typescript
it('should work', () => {
  const result = someFunction()
  console.log('Result:', result)
  expect(result).toBe('expected')
})
```

### 3. 使用调试器

在测试文件中添加 `debugger` 语句:

```typescript
it('should work', () => {
  const result = someFunction()
  debugger // 断点
  expect(result).toBe('expected')
})
```

然后使用 `--inspect` 标志运行测试:

```bash
node --inspect-brk ./node_modules/.bin/vitest
```

## 📚 常见测试场景

### 测试异步代码

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toBe('success')
})
```

### 测试错误处理

```typescript
it('should throw error for invalid input', () => {
  expect(() => {
    validateEmail('invalid')
  }).toThrow('Invalid email')
})
```

### 测试Promise

```typescript
it('should resolve promise', () => {
  return expect(fetchData()).resolves.toBe('data')
})

it('should reject promise', () => {
  return expect(fetchData()).rejects.toThrow('Error')
})
```

### 测试定时器

```typescript
import { vi } from 'vitest'

it('should call callback after delay', () => {
  vi.useFakeTimers()
  
  const callback = vi.fn()
  setTimeout(callback, 1000)
  
  vi.advanceTimersByTime(1000)
  
  expect(callback).toHaveBeenCalled()
  
  vi.useRealTimers()
})
```

## 🔍 持续集成

### GitHub Actions示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 📖 参考资源

- [Vitest官方文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest Matchers](https://jestjs.io/docs/expect)

## 🎉 总结

- ✅ 使用Vitest进行单元测试
- ✅ 测试覆盖核心功能
- ✅ 遵循测试最佳实践
- ✅ 保持测试简单和独立
- ✅ 定期运行测试确保代码质量

**记住**: 好的测试是代码质量的保障! 🚀
