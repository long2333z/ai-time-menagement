import { request } from './apiClient'

// 聊天消息接口
export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, any>
  created_at: string
}

// 聊天会话接口
export interface ChatSession {
  session_id: string
  message_count: number
  first_message: string
  last_message_at: string
}

// 创建消息请求
export interface CreateMessageRequest {
  session_id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, any>
}

// 聊天统计接口
export interface ChatStats {
  total_messages: number
  total_sessions: number
  user_messages: number
  assistant_messages: number
}

/**
 * 创建聊天消息
 */
export const createChatMessage = async (data: CreateMessageRequest): Promise<ChatMessage> => {
  try {
    const response = await request.post<ChatMessage>('/chat/messages', data)
    return response
  } catch (error) {
    console.error('Create chat message error:', error)
    throw error
  }
}

/**
 * 获取聊天消息列表
 */
export const getChatMessages = async (
  sessionId?: string,
  skip: number = 0,
  limit: number = 50
): Promise<ChatMessage[]> => {
  try {
    const params: any = { skip, limit }
    if (sessionId) {
      params.session_id = sessionId
    }
    
    const response = await request.get<ChatMessage[]>('/chat/messages', params)
    return response
  } catch (error) {
    console.error('Get chat messages error:', error)
    throw error
  }
}

/**
 * 获取聊天会话列表
 */
export const getChatSessions = async (
  skip: number = 0,
  limit: number = 20
): Promise<ChatSession[]> => {
  try {
    const response = await request.get<ChatSession[]>('/chat/sessions', { skip, limit })
    return response
  } catch (error) {
    console.error('Get chat sessions error:', error)
    throw error
  }
}

/**
 * 删除聊天会话
 */
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  try {
    await request.delete(`/chat/sessions/${sessionId}`)
  } catch (error) {
    console.error('Delete chat session error:', error)
    throw error
  }
}

/**
 * 删除单条消息
 */
export const deleteChatMessage = async (messageId: string): Promise<void> => {
  try {
    await request.delete(`/chat/messages/${messageId}`)
  } catch (error) {
    console.error('Delete chat message error:', error)
    throw error
  }
}

/**
 * 导出聊天历史
 */
export const exportChatHistory = async (
  sessionId?: string,
  format: 'json' | 'txt' = 'json'
): Promise<void> => {
  try {
    const params: any = { format }
    if (sessionId) {
      params.session_id = sessionId
    }
    
    // 构建URL
    const queryString = new URLSearchParams(params).toString()
    const url = `/chat/export?${queryString}`
    
    // 使用window.open下载文件
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const token = localStorage.getItem('auth_token')
    
    // 创建一个隐藏的a标签来触发下载
    const link = document.createElement('a')
    link.href = `${baseURL}${url}`
    link.download = `chat_history_${Date.now()}.${format}`
    
    // 如果有token，添加到URL
    if (token) {
      link.href += `&token=${token}`
    }
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Export chat history error:', error)
    throw error
  }
}

/**
 * 获取聊天统计
 */
export const getChatStats = async (): Promise<ChatStats> => {
  try {
    const response = await request.get<ChatStats>('/chat/stats')
    return response
  } catch (error) {
    console.error('Get chat stats error:', error)
    throw error
  }
}

/**
 * 保存对话到后端
 * 批量保存用户和助手的消息
 */
export const saveChatConversation = async (
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  sessionId?: string
): Promise<string> => {
  try {
    let currentSessionId = sessionId
    
    for (const message of messages) {
      const response = await createChatMessage({
        session_id: currentSessionId,
        role: message.role,
        content: message.content,
      })
      
      // 使用第一条消息返回的session_id
      if (!currentSessionId) {
        currentSessionId = response.session_id
      }
    }
    
    return currentSessionId!
  } catch (error) {
    console.error('Save chat conversation error:', error)
    throw error
  }
}

/**
 * 从localStorage加载会话ID
 */
export const getCurrentSessionId = (): string | null => {
  return localStorage.getItem('current_chat_session_id')
}

/**
 * 保存会话ID到localStorage
 */
export const setCurrentSessionId = (sessionId: string): void => {
  localStorage.setItem('current_chat_session_id', sessionId)
}

/**
 * 清除当前会话ID
 */
export const clearCurrentSessionId = (): void => {
  localStorage.removeItem('current_chat_session_id')
}

/**
 * 创建新会话
 */
export const createNewSession = (): string => {
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  setCurrentSessionId(newSessionId)
  return newSessionId
}
