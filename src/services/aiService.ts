// AI服务配置和调用模块

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIConfig {
  provider: 'openai' | 'deepseek' | 'custom'
  apiKey: string
  apiEndpoint?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatResponse {
  message: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * 从本地存储获取AI配置
 */
export const getAIConfig = (): AIConfig | null => {
  try {
    const configStr = localStorage.getItem('ai_config')
    if (!configStr) return null
    return JSON.parse(configStr)
  } catch (error) {
    console.error('获取AI配置失败:', error)
    return null
  }
}

/**
 * 保存AI配置到本地存储
 */
export const saveAIConfig = (config: AIConfig): void => {
  try {
    localStorage.setItem('ai_config', JSON.stringify(config))
  } catch (error) {
    console.error('保存AI配置失败:', error)
    throw new Error('保存配置失败')
  }
}

/**
 * 调用OpenAI API
 */
const callOpenAI = async (
  messages: AIMessage[],
  config: AIConfig
): Promise<ChatResponse> => {
  const endpoint = config.apiEndpoint || 'https://api.openai.com/v1/chat/completions'
  const model = config.model || 'gpt-3.5-turbo'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API调用失败: ${response.status}`)
  }

  const data = await response.json()

  return {
    message: data.choices[0]?.message?.content || '无法获取回复',
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  }
}

/**
 * 调用DeepSeek API
 */
const callDeepSeek = async (
  messages: AIMessage[],
  config: AIConfig
): Promise<ChatResponse> => {
  const endpoint = config.apiEndpoint || 'https://api.deepseek.com/v1/chat/completions'
  const model = config.model || 'deepseek-chat'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API调用失败: ${response.status}`)
  }

  const data = await response.json()

  return {
    message: data.choices[0]?.message?.content || '无法获取回复',
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  }
}

/**
 * 调用自定义API
 */
const callCustomAPI = async (
  messages: AIMessage[],
  config: AIConfig
): Promise<ChatResponse> => {
  if (!config.apiEndpoint) {
    throw new Error('自定义API需要提供endpoint')
  }

  const response = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'default',
      messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`API调用失败: ${response.status}`)
  }

  const data = await response.json()

  return {
    message: data.choices?.[0]?.message?.content || data.message || '无法获取回复',
    usage: data.usage,
  }
}

/**
 * 主聊天函数
 */
export const chat = async (messages: AIMessage[]): Promise<ChatResponse> => {
  const config = getAIConfig()

  if (!config) {
    throw new Error('请先在设置中配置AI API密钥')
  }

  if (!config.apiKey) {
    throw new Error('API密钥不能为空')
  }

  try {
    switch (config.provider) {
      case 'openai':
        return await callOpenAI(messages, config)
      case 'deepseek':
        return await callDeepSeek(messages, config)
      case 'custom':
        return await callCustomAPI(messages, config)
      default:
        throw new Error(`不支持的AI提供商: ${config.provider}`)
    }
  } catch (error: any) {
    console.error('AI调用错误:', error)
    throw new Error(error.message || 'AI服务调用失败')
  }
}

/**
 * 测试AI配置
 */
export const testAIConfig = async (config: AIConfig): Promise<boolean> => {
  try {
    const testMessages: AIMessage[] = [
      {
        role: 'user',
        content: '你好，这是一个测试消息。请简短回复。',
      },
    ]

    const response = await (config.provider === 'openai'
      ? callOpenAI(testMessages, config)
      : config.provider === 'deepseek'
      ? callDeepSeek(testMessages, config)
      : callCustomAPI(testMessages, config))

    return !!response.message
  } catch (error) {
    console.error('AI配置测试失败:', error)
    return false
  }
}

/**
 * 格式化消息历史（限制长度）
 */
export const formatMessageHistory = (
  messages: AIMessage[],
  maxMessages: number = 20
): AIMessage[] => {
  // 保留系统消息
  const systemMessages = messages.filter((m) => m.role === 'system')
  const otherMessages = messages.filter((m) => m.role !== 'system')

  // 只保留最近的N条消息
  const recentMessages = otherMessages.slice(-maxMessages)

  return [...systemMessages, ...recentMessages]
}

/**
 * 计算消息token数（粗略估算）
 */
export const estimateTokens = (text: string): number => {
  // 粗略估算：中文1字约1.5token，英文1词约1token
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = text.split(/\s+/).length
  return Math.ceil(chineseChars * 1.5 + englishWords)
}

/**
 * 获取推荐的AI配置
 */
export const getRecommendedConfig = (): Partial<AIConfig> => {
  return {
    temperature: 0.7,
    maxTokens: 2000,
  }
}
