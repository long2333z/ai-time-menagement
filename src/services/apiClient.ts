import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { errorHandler, ErrorType } from '../utils/errorHandler'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const REQUEST_TIMEOUT = 30000 // 30秒超时
const MAX_RETRIES = 3 // 最大重试次数

// Token管理
const TOKEN_KEY = 'auth_token'
const TOKEN_EXPIRY_KEY = 'token_expiry'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string, expiresIn: number = 24 * 60 * 60 * 1000): void => {
  localStorage.setItem(TOKEN_KEY, token)
  const expiry = Date.now() + expiresIn
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString())
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

export const isTokenExpired = (): boolean => {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiry) return true
  return Date.now() > parseInt(expiry)
}

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 自动添加token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    
    // 如果token存在且未过期,添加到请求头
    if (token && !isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 如果token过期,清除并跳转登录(除了登录和注册接口)
    if (token && isTokenExpired() && !config.url?.includes('/auth/')) {
      removeToken()
      window.location.href = '/login'
      return Promise.reject(new Error('Token expired'))
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回data部分
    return response.data
  },
  async (error: AxiosError) => {
    const { response, config } = error
    
    // 使用全局错误处理器
    errorHandler.handleError(error, ErrorType.API)
    
    // 处理401未授权错误
    if (response?.status === 401) {
      removeToken()
      
      // 延迟跳转,让用户看到提示
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }, 1500)
      
      return Promise.reject(error)
    }
    
    // 处理网络错误 - 自动重试
    if (!response) {
      const retryCount = (config as any).__retryCount || 0
      
      if (retryCount < MAX_RETRIES) {
        (config as any).__retryCount = retryCount + 1
        
        // 延迟重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        
        return apiClient(config!)
      }
    }
    
    return Promise.reject(error)
  }
)

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 通用请求方法
export const request = {
  get: <T = any>(url: string, params?: any): Promise<T> => {
    return apiClient.get(url, { params })
  },

  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.post(url, data, config)
  },

  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.put(url, data, config)
  },

  delete: <T = any>(url: string, config?: any): Promise<T> => {
    return apiClient.delete(url, config)
  },

  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.patch(url, data, config)
  },
}

// 网络状态监听
export const isOnline = (): boolean => {
  return navigator.onLine
}

export const onNetworkChange = (callback: (online: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// 导出axios实例供特殊场景使用
export default apiClient