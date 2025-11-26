import { useState, useRef, useEffect } from 'react'
import { Card, Input, Button, message, Spin, Avatar, Tag, Space } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined, ClearOutlined, BulbOutlined, SettingOutlined, HistoryOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { chat, getAIConfig, formatMessageHistory } from '../services/aiService'
import { 
  createChatMessage, 
  getChatMessages, 
  getCurrentSessionId, 
  setCurrentSessionId, 
  createNewSession,
  exportChatHistory 
} from '../services/chatService'

const { TextArea } = Input

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

const AIChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // 系统提示词
  const SYSTEM_PROMPT = `# 身份任务

你是一个时间管理和洞察方向的专家，能够根据用户输入的自然语言内容，生成日期排序和排程。

你需要识别用户的计划、当天待办事项、预估事项的时间，并按照用户给定的顺序或优先级，将事项排入日程表。如果用户的优先级不够清晰，你可以先排出一个大体的时间轴，剩余部分可以与用户进一步沟通，根据用户新的反馈再调整排期和日历表。

除了排期，你还需要成为用户的时间优化管理大师。你可以结合 GTD、双峰工作法、番茄钟等一系列世界上最伟大的优秀的时间管理理念，为用户提供一系列建议。无需具体向用户说明这些理论，只需根据用户一天的任务安排，反向推断出用户的身份、任务、场景和目标，分析用户想要实现的诉求，比如更好地管理精力、实现深度工作状态，或提升自我效能感。

在对用户身份进行反向推演的基础上，你能够智能分析，提出符合用户身份、洞察、需求和任务场景的最优建议。能够具体执行落地的一系列建议。这些建议最好能让用户有恍然大悟的感觉，带来顿悟时刻，让用户发现原来还可以这样做，发现一些时间盲区，并且觉得这些方法真的能够极大改善效率或提升自我效能的感觉。

# 案例

具体而言，

在暗时间的挖掘方面，我希望用户可以输入一天的大致时间和里程，然后进行初步的思路交流。之后，你可以思考用户有哪些大块的按时间划分的暗时间，这些暗时间是否有机会并行一些任务。并行任务是否有办法通过某些方式，让用户在同时进行两个任务时也能获得比较高效率的状态，这需要你对场景和事项有深度的洞察。例如，在长时间的飞机通勤路上，适合完成哪些任务？在酒店进行差旅时，到了酒店后可以做哪些不会受到时间干扰的任务？这些都是可以找到用户大块可能被浪费的时间段，并为其匹配可以并行的事务的逻辑。

在可以落地执行的方法上，我希望你的想法是可以落地执行的，给到方法论甚至工具。

举个例子，如果用户是深度内容创作者，你可以告诉他做一些灵感闪现和挖掘的环节，尝试购置电脑副屏或买一个巨大的大屏，能够极大提高文档写作和灵感捕捉的效率。
如果用户是希望自我提升的学习者，你可以洞察到他在通勤路上有大块时间。例如，如果他骑车上下班，可以建议使用骨传导耳机学习部分内容，既保证安全，又能有所收获。

此外，可以推荐一些好的方法，比如如果中午想要午睡但状况不佳，可以推荐使用 NSDR 睡眠方法，在不用真正睡觉的情况下完成休息。

这些能够极大改善和优化效率的方法，希望你都能尽量提供一些思路和建议。`

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化：加载历史消息或显示欢迎消息
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        // 获取当前会话ID
        const currentSessionId = getCurrentSessionId()
        
        if (currentSessionId) {
          // 加载历史消息
          const history = await getChatMessages(currentSessionId)
          if (history.length > 0) {
            setSessionId(currentSessionId)
            setMessages(history.map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.created_at)
            })))
            return
          }
        }
        
        // 如果没有历史消息，创建新会话并显示欢迎消息
        const newSessionId = createNewSession()
        setSessionId(newSessionId)
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: '你好！我是你的AI时间管理助手 🤖\n\n我可以帮你：\n\n✅ 规划每日任务和时间安排\n✅ 分析你的工作模式和效率\n✅ 挖掘"暗时间"，提升时间利用率\n✅ 提供个性化的时间管理建议\n✅ 推荐实用的工具和方法\n\n请告诉我你今天的计划，或者你想要优化的时间管理问题吧！',
            timestamp: new Date(),
          },
        ])
      } catch (error) {
        console.error('加载聊天历史失败:', error)
        // 失败时创建新会话
        const newSessionId = createNewSession()
        setSessionId(newSessionId)
      }
    }
    
    loadChatHistory()
  }, [])

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入消息内容')
      return
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // 检查AI配置
      const config = getAIConfig()
      if (!config || !config.apiKey) {
        message.warning('请先配置AI API密钥')
        navigate('/api-config')
        setIsLoading(false)
        return
      }

      // 准备消息历史
      const messageHistory = formatMessageHistory([
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: inputValue },
      ])

      // 调用AI服务
      const response = await chat(messageHistory)

      // 添加AI回复
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // 保存对话到后端
      try {
        setIsSaving(true)
        if (sessionId) {
          // 保存用户消息
          await createChatMessage({
            session_id: sessionId,
            role: 'user',
            content: inputValue
          })
          
          // 保存AI回复
          await createChatMessage({
            session_id: sessionId,
            role: 'assistant',
            content: response.message
          })
        }
      } catch (saveError) {
        console.error('保存对话失败:', saveError)
        // 保存失败不影响用户体验，只记录错误
      } finally {
        setIsSaving(false)
      }
    } catch (error: any) {
      console.error('AI调用错误:', error)
      message.error(error.message || 'AI服务调用失败')
      
      // 如果是配置问题，提示用户
      if (error.message?.includes('配置')) {
        setTimeout(() => {
          navigate('/api-config')
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 清空对话（创建新会话）
  const handleClear = () => {
    const newSessionId = createNewSession()
    setSessionId(newSessionId)
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '新对话已开始。有什么我可以帮你的吗？',
        timestamp: new Date(),
      },
    ])
    message.success('已创建新对话')
  }
  
  // 导出对话历史
  const handleExport = async () => {
    try {
      await exportChatHistory(sessionId || undefined, 'json')
      message.success('对话历史已导出')
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败，请重试')
    }
  }

  // 快捷问题
  const quickQuestions = [
    '帮我规划今天的工作任务',
    '如何提高工作效率？',
    '我的通勤时间很长，如何利用？',
    '推荐一些时间管理工具',
  ]

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <RobotOutlined className="text-primary-600" />
            AI时间管理助手
          </h1>
          <p className="text-gray-600 mt-2">智能分析，个性化建议，助你高效管理时间</p>
        </div>
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={messages.length <= 1}
          >
            导出对话
          </Button>
          <Button 
            icon={<HistoryOutlined />} 
            onClick={() => navigate('/chat-history')}
          >
            历史记录
          </Button>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => navigate('/api-config')}
          >
            API配置
          </Button>
          <Button 
            icon={<ClearOutlined />} 
            onClick={handleClear}
          >
            新对话
          </Button>
        </Space>
      </div>

      {/* 快捷问题 */}
      {messages.length <= 1 && (
        <Card size="small" className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <BulbOutlined className="text-blue-600" />
            <span className="font-semibold text-blue-900">快速开始</span>
          </div>
          <Space wrap>
            {quickQuestions.map((q, index) => (
              <Tag
                key={index}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => handleQuickQuestion(q)}
              >
                {q}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* 消息列表 */}
      <Card 
        className="flex-1 overflow-hidden"
        bodyStyle={{ 
          height: '100%', 
          padding: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* 头像 */}
              <Avatar
                size={40}
                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                className={
                  msg.role === 'user'
                    ? 'bg-primary-600'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                }
              />

              {/* 消息内容 */}
              <div
                className={`flex-1 max-w-[80%] ${
                  msg.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* 加载中 */}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar
                size={40}
                icon={<RobotOutlined />}
                className="bg-gradient-to-br from-purple-500 to-blue-500"
              />
              <div className="bg-gray-100 p-3 rounded-lg">
                <Spin size="small" />
                <span className="ml-2 text-gray-600">正在思考...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="输入你的问题或今天的计划... (Shift+Enter换行)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={isLoading}
              disabled={!inputValue.trim()}
            >
              发送
            </Button>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            💡 提示：详细描述你的任务和时间安排，我能给出更精准的建议
          </div>
        </div>
      </Card>

      {/* Footer signature */}
      <div className="text-center py-2 text-gray-500 text-sm">
        <p>
          由{' '}
          <a
            href="https://with.woa.com/"
            style={{ color: '#8A2BE2' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            with
          </a>{' '}
          通过自然语言生成
        </p>
      </div>
    </div>
  )
}

export default AIChatPage
