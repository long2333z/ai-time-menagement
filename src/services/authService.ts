import { request, setToken, removeToken, getToken } from './apiClient'
import { UserProfile } from '../types'

// 登录请求参数
export interface LoginRequest {
  email: string
  password: string
}

// 注册请求参数
export interface RegisterRequest {
  email: string
  password: string
  name?: string
  timezone?: string
  language?: string
}

// 登录/注册响应
export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    name?: string
    subscription_tier: string
  }
}

// 用户信息响应
export interface UserResponse {
  id: string
  email: string
  name?: string
  timezone: string
  language: string
  subscription_tier: string
  occupation?: string
  work_mode?: string
  created_at: string
  updated_at?: string
}

// 更新用户信息请求
export interface UpdateUserRequest {
  name?: string
  timezone?: string
  language?: string
  occupation?: string
  work_mode?: string
}

/**
 * 用户注册
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await request.post<AuthResponse>('/auth/register', data)
    
    // 保存token
    if (response.access_token) {
      setToken(response.access_token)
    }
    
    return response
  } catch (error) {
    console.error('Register error:', error)
    throw error
  }
}

/**
 * 用户登录
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    // FastAPI的OAuth2PasswordRequestForm需要使用form-data格式
    const formData = new FormData()
    formData.append('username', data.email) // OAuth2使用username字段
    formData.append('password', data.password)
    
    const response = await request.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    // 保存token
    if (response.access_token) {
      setToken(response.access_token)
    }
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

/**
 * 退出登录
 */
export const logout = (): void => {
  removeToken()
  // 清除其他本地存储的用户数据
  localStorage.removeItem('user_profile')
  localStorage.removeItem('app_state')
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  try {
    const response = await request.get<UserResponse>('/auth/me')
    
    // 缓存用户信息
    localStorage.setItem('user_profile', JSON.stringify(response))
    
    return response
  } catch (error) {
    console.error('Get current user error:', error)
    throw error
  }
}

/**
 * 更新当前用户信息
 */
export const updateCurrentUser = async (data: UpdateUserRequest): Promise<UserResponse> => {
  try {
    const response = await request.put<{ message: string; user: UserResponse }>('/auth/me', data)
    
    // 更新缓存
    if (response.user) {
      localStorage.setItem('user_profile', JSON.stringify(response.user))
    }
    
    return response.user
  } catch (error) {
    console.error('Update user error:', error)
    throw error
  }
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
  const token = getToken()
  return !!token
}

/**
 * 获取缓存的用户信息
 */
export const getCachedUser = (): UserResponse | null => {
  try {
    const cached = localStorage.getItem('user_profile')
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

/**
 * 刷新用户信息
 */
export const refreshUserInfo = async (): Promise<UserResponse | null> => {
  if (!isAuthenticated()) {
    return null
  }
  
  try {
    return await getCurrentUser()
  } catch (error) {
    console.error('Refresh user info error:', error)
    return null
  }
}
