import { useState } from 'react'
import { Card, Button, Empty, message, Row, Col, Statistic, Tag } from 'antd'
import { AudioOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons'
import VoiceInput from '../components/VoiceInput'
import { useAppStore } from '../store/useAppStore'
import { DailyReview } from '../types'
import { format } from 'date-fns'

const ReviewPage = () => {
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const { tasks, dailyReviews, addDailyReview } = useAppStore()

  const handleVoiceComplete = (transcript: string) => {
    if (!transcript.trim()) {
      message.warning('请说出您的复盘内容')
      return
    }

    try {
      // 计算今日任务统计
      const today = new Date()
      const todayTasks = tasks.filter((task) => {
        if (!task.startTime) return false
        const taskDate = new Date(task.startTime)
        return (
          taskDate.getDate() === today.getDate() &&
          taskDate.getMonth() === today.getMonth() &&
          taskDate.getFullYear() === today.getFullYear()
        )
      })

      const completedTasks = todayTasks.filter((t) => t.status === 'completed')
      const totalTasks = todayTasks.length
      const completedCount = completedTasks.length
      const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
      const totalTimeSpent = completedTasks.reduce((sum, task) => sum + (task.duration || 0), 0)

      // 创建复盘记录
      const review: DailyReview = {
        id: `review-${Date.now()}`,
        date: today,
        planId: `plan-${format(today, 'yyyy-MM-dd')}`, // 简单的计划ID关联
        voiceTranscript: transcript,
        completionRate,
        totalTasks,
        completedTasks: completedCount,
        totalTimeSpent,
        notes: transcript,
        createdAt: new Date(),
      }

      addDailyReview(review)
      message.success('复盘记录已保存！')
      setShowVoiceInput(false)
    } catch (error) {
      console.error('Error saving review:', error)
      message.error('保存复盘失败，请重试')
    }
  }

  // 获取今日复盘记录
  const today = new Date()
  const todayReviews = dailyReviews.filter((review) => {
    const reviewDate = new Date(review.date)
    return (
      reviewDate.getDate() === today.getDate() &&
      reviewDate.getMonth() === today.getMonth() &&
      reviewDate.getFullYear() === today.getFullYear()
    )
  })

  const latestReview = todayReviews.length > 0 ? todayReviews[todayReviews.length - 1] : null

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🌙 晚间复盘</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">用2分钟回顾你的一天</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<AudioOutlined />}
          onClick={() => setShowVoiceInput(true)}
          className="w-full sm:w-auto h-12 md:h-14 text-base md:text-lg font-semibold"
        >
          开始语音复盘
        </Button>
      </div>

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <Card className="border-2 border-primary-300 shadow-lg">
          <div className="text-center mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              🎤 语音复盘
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              说出您今天的收获、感悟和改进计划，AI会自动记录
            </p>
          </div>
          <VoiceInput
            onComplete={handleVoiceComplete}
            onCancel={() => setShowVoiceInput(false)}
            placeholder="例如：今天完成了3个重要任务，效率很高。明天要更注意时间管理..."
          />
        </Card>
      )}

      {/* Today's Review Statistics */}
      {latestReview && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 今日数据统计</h3>
          </div>
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={6}>
              <Card className="text-center">
                <Statistic
                  title={<span className="text-xs md:text-sm">完成率</span>}
                  value={latestReview.completionRate}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{
                    color: latestReview.completionRate >= 80 ? '#10b981' :
                           latestReview.completionRate >= 50 ? '#f59e0b' : '#ef4444',
                    fontSize: '24px'
                  }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="text-center">
                <Statistic
                  title={<span className="text-xs md:text-sm">已完成</span>}
                  value={latestReview.completedTasks}
                  suffix={<span className="text-sm">/{latestReview.totalTasks}</span>}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#0ea5e9', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="text-center">
                <Statistic
                  title={<span className="text-xs md:text-sm">专注时长</span>}
                  value={(latestReview.totalTimeSpent / 60).toFixed(1)}
                  suffix={<span className="text-sm">h</span>}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#f59e0b', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="text-center">
                <div className="py-2">
                  <div className="text-xs md:text-sm text-gray-500 mb-1">复盘时间</div>
                  <div className="text-sm font-medium text-gray-900">
                    {format(latestReview.createdAt, 'HH:mm')}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* Review Content */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg font-semibold">📝 今日复盘</span>
            {latestReview && (
              <Tag color="green">已完成</Tag>
            )}
          </div>
        }
      >
        {!latestReview ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <p className="text-gray-600 mb-4">今日还没有复盘记录</p>
                <Button
                  type="primary"
                  size="large"
                  icon={<AudioOutlined />}
                  onClick={() => setShowVoiceInput(true)}
                  className="h-12 md:h-14"
                >
                  开始语音复盘
                </Button>
              </div>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">复盘内容：</h4>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {latestReview.voiceTranscript}
              </p>
            </div>

            {latestReview.notes && latestReview.notes !== latestReview.voiceTranscript && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">额外笔记：</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {latestReview.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                size="large"
                icon={<AudioOutlined />}
                onClick={() => setShowVoiceInput(true)}
              >
                重新复盘
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Tips Card */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💭</div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2">
              复盘小贴士
            </h4>
            <ul className="text-xs md:text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>回顾今天完成了哪些重要任务</li>
              <li>思考哪些地方做得好，哪些需要改进</li>
              <li>总结今天的收获和感悟</li>
              <li>为明天制定具体的改进计划</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ReviewPage
