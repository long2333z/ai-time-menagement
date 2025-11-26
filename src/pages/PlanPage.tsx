import { useState } from 'react'
import { Card, Button, Empty, message } from 'antd'
import { AudioOutlined, PlusOutlined } from '@ant-design/icons'
import VoiceInput from '../components/VoiceInput'
import TaskTimeline from '../components/TaskTimeline'
import { useAppStore } from '../store/useAppStore'
import { parseChineseTranscript } from '../services/aiParserCN'
import { Task } from '../types'

const PlanPage = () => {
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const { tasks, addTask, updateTask, deleteTask } = useAppStore()

  const handleVoiceComplete = (transcript: string) => {
    if (!transcript.trim()) {
      message.warning('请说出您的计划内容')
      return
    }

    try {
      // Parse voice input to tasks
      const parsedTasks = parseChineseTranscript(transcript)
      
      if (parsedTasks.length === 0) {
        message.warning('未能识别到有效的任务，请重新尝试')
        return
      }

      // Add tasks to store
      parsedTasks.forEach((task) => {
        addTask(task)
      })

      message.success(`成功添加 ${parsedTasks.length} 个任务！`)
      setShowVoiceInput(false)
    } catch (error) {
      console.error('Error parsing voice input:', error)
      message.error('解析任务失败，请重试')
    }
  }

  const handleToggleStatus = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const statusFlow: Record<Task['status'], Task['status']> = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending',
      'cancelled': 'pending',
    }

    updateTask(taskId, {
      status: statusFlow[task.status],
      completedAt: statusFlow[task.status] === 'completed' ? new Date() : undefined,
    })
  }

  const todayTasks = tasks.filter((task) => {
    if (!task.startTime) return false
    const today = new Date()
    const taskDate = new Date(task.startTime)
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    )
  })

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🌅 早晨计划</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">用2分钟规划你的一天</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<AudioOutlined />}
          onClick={() => setShowVoiceInput(true)}
          className="w-full sm:w-auto h-12 md:h-14 text-base md:text-lg font-semibold"
        >
          开始语音规划
        </Button>
      </div>

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <Card className="border-2 border-primary-300 shadow-lg">
          <div className="text-center mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              🎤 语音规划
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              说出您今天的计划，AI会自动为您整理
            </p>
          </div>
          <VoiceInput
            onComplete={handleVoiceComplete}
            onCancel={() => setShowVoiceInput(false)}
            placeholder="例如：早上9点开会，10点到11点半做产品设计评审..."
          />
        </Card>
      )}

      {/* AI Suggestions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-1">
              AI建议
            </h4>
            <p className="text-xs md:text-sm text-gray-600">
              根据您的历史数据，建议在上午安排重要任务，下午处理沟通类工作。
              记得在任务间留出休息时间哦！
            </p>
          </div>
        </div>
      </Card>

      {/* Tasks Timeline */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg font-semibold">
              📋 今日任务 ({todayTasks.length})
            </span>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setShowVoiceInput(true)}
            >
              添加
            </Button>
          </div>
        }
      >
        {todayTasks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <p className="text-gray-600 mb-4">还没有今日任务</p>
                <Button
                  type="primary"
                  size="large"
                  icon={<AudioOutlined />}
                  onClick={() => setShowVoiceInput(true)}
                  className="h-12 md:h-14"
                >
                  开始语音规划
                </Button>
              </div>
            }
          />
        ) : (
          <TaskTimeline
            tasks={todayTasks}
            onToggleStatus={handleToggleStatus}
            onDeleteTask={deleteTask}
          />
        )}
      </Card>

      {/* Tips Card */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💭</div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2">
              语音规划小贴士
            </h4>
            <ul className="text-xs md:text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>清晰说出任务名称和时间，如"上午9点开会"</li>
              <li>可以说"重要"、"紧急"来标记优先级</li>
              <li>说"大约1小时"来指定任务时长</li>
              <li>一次可以规划多个任务，AI会自动分解</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Footer signature */}
      <div className="text-center py-4 text-gray-500 text-xs md:text-sm">
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

export default PlanPage