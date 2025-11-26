import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button, Result } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * 错误边界组件
 * 捕获子组件树中的JavaScript错误，记录错误并显示降级UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新state，下次渲染将显示降级UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 更新state
    this.setState({
      error,
      errorInfo,
    })

    // 调用外部错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 上报错误到日志系统
    this.logErrorToService(error, errorInfo)
  }

  /**
   * 上报错误到日志服务
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // 构建错误信息
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      // 发送到后端日志API（如果可用）
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/logs/error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData),
        }).catch(err => {
          console.error('Failed to log error to service:', err)
        })
      }

      // 同时保存到localStorage作为备份
      const errorLog = {
        ...errorData,
        id: Date.now().toString(),
      }
      
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]')
      existingLogs.push(errorLog)
      
      // 只保留最近50条错误日志
      if (existingLogs.length > 50) {
        existingLogs.shift()
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs))
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError)
    }
  }

  /**
   * 重置错误状态
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * 刷新页面
   */
  private handleReload = () => {
    window.location.reload()
  }

  /**
   * 返回首页
   */
  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义降级UI，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认降级UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full">
            <Result
              status="error"
              title="页面出现错误"
              subTitle="抱歉，页面遇到了一些问题。您可以尝试刷新页面或返回首页。"
              extra={[
                <Button
                  key="reload"
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                  size="large"
                >
                  刷新页面
                </Button>,
                <Button
                  key="home"
                  icon={<HomeOutlined />}
                  onClick={this.handleGoHome}
                  size="large"
                >
                  返回首页
                </Button>,
              ]}
            >
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 text-left">
                  <details className="bg-gray-100 p-4 rounded-lg">
                    <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                      错误详情（开发模式）
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong className="text-red-600">错误信息：</strong>
                        <pre className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
                          {this.state.error.message}
                        </pre>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong className="text-red-600">堆栈信息：</strong>
                          <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-64">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong className="text-red-600">组件堆栈：</strong>
                          <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-64">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </Result>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
