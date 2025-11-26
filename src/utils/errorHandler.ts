import { message } from 'antd'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType
  message: string
  code?: string | number
  details?: any
  timestamp: string
}

/**
 * API错误响应接口
 */
export interface APIError {
  detail?: string
  message?: string
  error?: string
  status?: number
  code?: string
}

/**
 * 全局错误处理器类
 */
class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: ErrorInfo[] = []
  private maxLogSize = 100

  private constructor() {
    this.initGlobalHandlers()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * 初始化全局错误处理器
   */
  private initGlobalHandlers() {
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      this.handleError(event.reason, ErrorType.UNKNOWN)
      event.preventDefault()
    })

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      this.handleError(event.error, ErrorType.UNKNOWN)
    })
  }

  /**
   * 处理错误
   */
  public handleError(error: any, type: ErrorType = ErrorType.UNKNOWN): ErrorInfo {
    const errorInfo = this.parseError(error, type)
    
    // 记录错误
    this.logError(errorInfo)
    
    // 显示用户友好的错误提示
    this.showErrorMessage(errorInfo)
    
    return errorInfo
  }

  /**
   * 解析错误对象
   */
  private parseError(error: any, type: ErrorType): ErrorInfo {
    const timestamp = new Date().toISOString()

    // 处理网络错误
    if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
      return {
        type: ErrorType.NETWORK,
        message: '网络连接失败，请检查您的网络设置',
        code: error.code,
        details: error,
        timestamp,
      }
    }

    // 处理API错误
    if (error?.response) {
      const apiError: APIError = error.response.data || {}
      const status = error.response.status

      // 认证错误
      if (status === 401 || status === 403) {
        return {
          type: ErrorType.AUTH,
          message: apiError.detail || '认证失败，请重新登录',
          code: status,
          details: apiError,
          timestamp,
        }
      }

      // 验证错误
      if (status === 400 || status === 422) {
        return {
          type: ErrorType.VALIDATION,
          message: apiError.detail || apiError.message || '请求参数错误',
          code: status,
          details: apiError,
          timestamp,
        }
      }

      // 服务器错误
      if (status >= 500) {
        return {
          type: ErrorType.API,
          message: '服务器错误，请稍后重试',
          code: status,
          details: apiError,
          timestamp,
        }
      }

      // 其他API错误
      return {
        type: ErrorType.API,
        message: apiError.detail || apiError.message || apiError.error || '请求失败',
        code: status,
        details: apiError,
        timestamp,
      }
    }

    // 处理标准Error对象
    if (error instanceof Error) {
      return {
        type,
        message: error.message || '发生未知错误',
        details: {
          name: error.name,
          stack: error.stack,
        },
        timestamp,
      }
    }

    // 处理字符串错误
    if (typeof error === 'string') {
      return {
        type,
        message: error,
        timestamp,
      }
    }

    // 未知错误
    return {
      type: ErrorType.UNKNOWN,
      message: '发生未知错误',
      details: error,
      timestamp,
    }
  }

  /**
   * 记录错误到日志
   */
  private logError(errorInfo: ErrorInfo) {
    // 添加到内存日志
    this.errorLog.push(errorInfo)
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }

    // 保存到localStorage
    try {
      const existingLogs = JSON.parse(localStorage.getItem('app_error_logs') || '[]')
      existingLogs.push(errorInfo)
      
      // 只保留最近50条
      if (existingLogs.length > 50) {
        existingLogs.shift()
      }
      
      localStorage.setItem('app_error_logs', JSON.stringify(existingLogs))
    } catch (e) {
      console.error('Failed to save error log to localStorage:', e)
    }

    // 在开发环境打印详细错误
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 Error [${errorInfo.type}]`)
      console.error('Message:', errorInfo.message)
      console.error('Code:', errorInfo.code)
      console.error('Details:', errorInfo.details)
      console.error('Timestamp:', errorInfo.timestamp)
      console.groupEnd()
    }
  }

  /**
   * 显示用户友好的错误提示
   */
  private showErrorMessage(errorInfo: ErrorInfo) {
    // 根据错误类型显示不同的提示
    switch (errorInfo.type) {
      case ErrorType.NETWORK:
        message.error({
          content: errorInfo.message,
          duration: 5,
          key: 'network-error',
        })
        break

      case ErrorType.AUTH:
        message.error({
          content: errorInfo.message,
          duration: 5,
          key: 'auth-error',
        })
        // 认证错误时，可能需要跳转到登录页
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }, 2000)
        break

      case ErrorType.VALIDATION:
        message.warning({
          content: errorInfo.message,
          duration: 4,
        })
        break

      case ErrorType.API:
        message.error({
          content: errorInfo.message,
          duration: 4,
        })
        break

      default:
        message.error({
          content: errorInfo.message || '操作失败，请重试',
          duration: 3,
        })
    }
  }

  /**
   * 获取错误日志
   */
  public getErrorLogs(): ErrorInfo[] {
    return [...this.errorLog]
  }

  /**
   * 清除错误日志
   */
  public clearErrorLogs() {
    this.errorLog = []
    localStorage.removeItem('app_error_logs')
  }

  /**
   * 上报错误到服务器
   */
  public async reportError(errorInfo: ErrorInfo): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    try {
      await fetch('/api/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...errorInfo,
          userAgent: navigator.userAgent,
          url: window.location.href,
          platform: navigator.platform,
        }),
      })
    } catch (e) {
      console.error('Failed to report error to server:', e)
    }
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance()

/**
 * 便捷的错误处理函数
 */
export const handleError = (error: any, type?: ErrorType) => {
  return errorHandler.handleError(error, type)
}

/**
 * 处理API错误
 */
export const handleAPIError = (error: any) => {
  return errorHandler.handleError(error, ErrorType.API)
}

/**
 * 处理网络错误
 */
export const handleNetworkError = (error: any) => {
  return errorHandler.handleError(error, ErrorType.NETWORK)
}

/**
 * 处理认证错误
 */
export const handleAuthError = (error: any) => {
  return errorHandler.handleError(error, ErrorType.AUTH)
}

/**
 * 处理验证错误
 */
export const handleValidationError = (error: any) => {
  return errorHandler.handleError(error, ErrorType.VALIDATION)
}

export default errorHandler
