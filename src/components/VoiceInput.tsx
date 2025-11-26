import { useState, useEffect, useRef } from 'react'
import { Button, Card, message, Space, Typography, Input, Tabs } from 'antd'
import {
  AudioOutlined,
  PauseCircleOutlined,
  StopOutlined,
  EditOutlined,
  CheckOutlined,
  FormOutlined,
} from '@ant-design/icons'

const { Text, Paragraph } = Typography
const { TextArea } = Input

interface VoiceInputProps {
  onComplete?: (transcript: string) => void
  onCancel?: () => void
  placeholder?: string
  maxDuration?: number // in seconds
}

type RecordingStatus = 'idle' | 'recording' | 'paused' | 'processing' | 'completed'
type InputMode = 'voice' | 'text'

const VoiceInput: React.FC<VoiceInputProps> = ({
  onComplete,
  onCancel,
  placeholder = '点击麦克风开始说话，或切换到文本输入...',
  maxDuration = 120, // 2 minutes default
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [textInput, setTextInput] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isSupported, setIsSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setStatus('recording')
      startTimer()
    }

    recognition.onresult = (event: any) => {
      let interimText = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalText += transcriptPart + ' '
        } else {
          interimText += transcriptPart
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText)
      }
      setInterimTranscript(interimText)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        message.warning('未检测到语音，请重试')
      } else if (event.error === 'audio-capture') {
        message.error('无法访问麦克风，请检查权限设置')
      } else {
        message.error(`错误: ${event.error}`)
      }
      stopRecording()
    }

    recognition.onend = () => {
      if (status === 'recording') {
        // Auto-restart if still in recording mode (for continuous recording)
        try {
          recognition.start()
        } catch (e) {
          console.log('Recognition ended')
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => {
        const newDuration = prev + 1
        if (newDuration >= maxDuration) {
          stopRecording()
          message.info(`已达到最大时长 ${maxDuration} 秒`)
        }
        return newDuration
      })
    }, 1000) as unknown as number
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current) return

    try {
      setTranscript('')
      setInterimTranscript('')
      setDuration(0)
      recognitionRef.current.start()
      message.success('开始录音，请说话...')
    } catch (error) {
      console.error('Error starting recognition:', error)
      message.error('启动录音失败，请重试')
    }
  }

  const pauseRecording = () => {
    if (recognitionRef.current && status === 'recording') {
      recognitionRef.current.stop()
      stopTimer()
      setStatus('paused')
      message.info('录音已暂停')
    }
  }

  const resumeRecording = () => {
    if (recognitionRef.current && status === 'paused') {
      try {
        recognitionRef.current.start()
        setStatus('recording')
        message.success('继续录音')
      } catch (error) {
        console.error('Error resuming recognition:', error)
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    stopTimer()
    setStatus('processing')
    
    // Simulate processing delay
    setTimeout(() => {
      setStatus('completed')
      if (transcript.trim()) {
        onComplete?.(transcript.trim())
        message.success('语音输入完成！')
      }
    }, 500)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    if (transcript.trim()) {
      onComplete?.(transcript.trim())
      message.success('修改已保存！')
    }
  }

  const handleReset = () => {
    setTranscript('')
    setInterimTranscript('')
    setDuration(0)
    setStatus('idle')
    setIsEditing(false)
  }

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      message.warning('请输入内容')
      return
    }
    onComplete?.(textInput.trim())
    message.success('任务已添加！')
    setTextInput('')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return '录音中...'
      case 'paused':
        return '已暂停'
      case 'processing':
        return '处理中...'
      case 'completed':
        return '已完成'
      default:
        return '就绪'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'recording':
        return '#ff4d4f'
      case 'paused':
        return '#faad14'
      case 'processing':
        return '#1890ff'
      case 'completed':
        return '#52c41a'
      default:
        return '#8c8c8c'
    }
  }

  // Text Input Mode
  const renderTextInput = () => (
    <div className="space-y-4">
      <TextArea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="输入您的任务计划，例如：&#10;早上9点开会&#10;10点到11点半做产品设计评审&#10;下午2点写周报&#10;&#10;可以一次输入多个任务，AI会自动识别和整理"
        rows={8}
        size="large"
        className="text-base"
        maxLength={2000}
        showCount
      />
      
      <div className="flex gap-3 justify-end">
        <Button size="large" onClick={onCancel}>
          取消
        </Button>
        <Button 
          type="primary" 
          size="large" 
          onClick={handleTextSubmit}
          disabled={!textInput.trim()}
        >
          确认添加
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <Text className="text-sm text-gray-600">
          💡 <strong>输入提示：</strong>
          <ul className="mt-2 ml-4 space-y-1 list-disc">
            <li>可以直接输入时间和任务，如"9点开会"</li>
            <li>可以标注优先级，如"重要：完成项目报告"</li>
            <li>可以指定时长，如"写代码（2小时）"</li>
            <li>一次可以输入多个任务，每行一个</li>
          </ul>
        </Text>
      </div>
    </div>
  )

  // Voice Input Mode
  const renderVoiceInput = () => {
    if (!isSupported) {
      return (
        <div className="text-center py-8">
          <AudioOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <p className="mt-4 text-gray-500">
            您的浏览器不支持语音输入功能
            <br />
            请使用 Chrome、Edge 或 Safari 浏览器
            <br />
            或切换到文本输入模式
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center justify-between">
          <Space>
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: getStatusColor() }}
            />
            <Text strong style={{ color: getStatusColor() }}>
              {getStatusText()}
            </Text>
          </Space>
          {status !== 'idle' && (
            <Text type="secondary">{formatDuration(duration)} / {formatDuration(maxDuration)}</Text>
          )}
        </div>

        {/* Transcript Display */}
        <div className="min-h-[120px] p-4 bg-gray-50 rounded-lg border border-gray-200">
          {transcript || interimTranscript ? (
            <Paragraph
              editable={isEditing ? {
                onChange: setTranscript,
                icon: <CheckOutlined />,
                tooltip: '保存',
                onEnd: handleSaveEdit,
              } : false}
              className="mb-0"
            >
              {transcript}
              {interimTranscript && (
                <Text type="secondary" italic>
                  {interimTranscript}
                </Text>
              )}
            </Paragraph>
          ) : (
            <Text type="secondary" italic>
              {placeholder}
            </Text>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3 flex-wrap">
          {status === 'idle' && (
            <Button
              type="primary"
              size="large"
              icon={<AudioOutlined />}
              onClick={startRecording}
              className="px-8"
            >
              开始录音
            </Button>
          )}

          {status === 'recording' && (
            <>
              <Button
                size="large"
                icon={<PauseCircleOutlined />}
                onClick={pauseRecording}
              >
                暂停
              </Button>
              <Button
                danger
                size="large"
                icon={<StopOutlined />}
                onClick={stopRecording}
              >
                停止
              </Button>
            </>
          )}

          {status === 'paused' && (
            <>
              <Button
                type="primary"
                size="large"
                icon={<AudioOutlined />}
                onClick={resumeRecording}
              >
                继续
              </Button>
              <Button
                danger
                size="large"
                icon={<StopOutlined />}
                onClick={stopRecording}
              >
                停止
              </Button>
            </>
          )}

          {(status === 'completed' || status === 'processing') && transcript && (
            <>
              {!isEditing && (
                <Button
                  size="large"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  编辑
                </Button>
              )}
              <Button
                size="large"
                onClick={handleReset}
              >
                新录音
              </Button>
            </>
          )}
        </div>

        {/* Tips */}
        {status === 'idle' && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <Text className="text-sm text-gray-600">
              💡 <strong>语音提示：</strong>清晰自然地说话，可以随时暂停和继续
            </Text>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="voice-input-card">
      <Tabs
        activeKey={inputMode}
        onChange={(key) => setInputMode(key as InputMode)}
        items={[
          {
            key: 'text',
            label: (
              <span>
                <FormOutlined /> 文本输入
              </span>
            ),
            children: renderTextInput(),
          },
          {
            key: 'voice',
            label: (
              <span>
                <AudioOutlined /> 语音输入
              </span>
            ),
            children: renderVoiceInput(),
          },
        ]}
      />
    </Card>
  )
}

export default VoiceInput
