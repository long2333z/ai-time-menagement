import { useNavigate } from 'react-router-dom'
import { Card, Button, Row, Col, Statistic, Tag, Empty } from 'antd'
import {
  ClockCircleOutlined,
  RocketOutlined,
  BulbOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../store/useAppStore'
import { format } from 'date-fns'
import { useEffect } from 'react'

const HomePage = () => {
  const navigate = useNavigate()
  const { tasks, insights, loadDemoData, user } = useAppStore()

  // Load demo data if no user exists
  useEffect(() => {
    if (!user) {
      loadDemoData()
    }
  }, [user, loadDemoData])

  // Calculate statistics
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

  const completedTasks = todayTasks.filter((t) => t.status === 'completed')
  const completionRate = todayTasks.length > 0 
    ? Math.round((completedTasks.length / todayTasks.length) * 100) 
    : 0

  const totalTimeSpent = completedTasks.reduce((sum, task) => sum + (task.duration || 0), 0)
  const timeSavedHours = (totalTimeSpent / 60).toFixed(1)

  const unreadInsights = insights.filter((i) => !i.isRead).length

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      {/* Hero Section - 移动端优化 */}
      <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
        <div className="text-center py-6 md:py-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            欢迎回来！
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 px-2">
            2分钟语音规划，AI深度洞察
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Button
              type="primary"
              size="large"
              icon={<ClockCircleOutlined />}
              onClick={() => navigate('/plan')}
              className="h-12 md:h-14 text-base md:text-lg font-semibold w-full sm:w-auto"
              block
            >
              开始早晨计划
            </Button>
            <Button
              size="large"
              icon={<RocketOutlined />}
              onClick={() => navigate('/review')}
              className="h-12 md:h-14 text-base md:text-lg font-semibold w-full sm:w-auto"
              block
            >
              晚间复盘
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats - 移动端2列布局 */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs md:text-sm">今日任务</span>}
              value={todayTasks.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#0ea5e9', fontSize: '24px' }}
              suffix={<span className="text-sm">个</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs md:text-sm">完成率</span>}
              value={completionRate}
              suffix={<span className="text-sm">%</span>}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ 
                color: completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#f59e0b' : '#ef4444',
                fontSize: '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs md:text-sm">专注时长</span>}
              value={timeSavedHours}
              suffix={<span className="text-sm">h</span>}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#f59e0b', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-xs md:text-sm">AI洞察</span>}
              value={unreadInsights}
              suffix={<span className="text-sm">条</span>}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#8b5cf6', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Today's Tasks - 简化移动端显示 */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg font-semibold">📋 今日任务</span>
            <Button 
              type="link" 
              size="small"
              onClick={() => navigate('/plan')}
              icon={<ArrowRightOutlined />}
            >
              查看全部
            </Button>
          </div>
        }
      >
        {todayTasks.length === 0 ? (
          <Empty 
            description="今天还没有任务，开始规划吧！"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<ClockCircleOutlined />}
              onClick={() => navigate('/plan')}
            >
              开始规划
            </Button>
          </Empty>
        ) : (
          <div className="space-y-3">
            {todayTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {task.status === 'completed' ? (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                  ) : (
                    <ClockCircleOutlined className="text-gray-400 text-lg" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm md:text-base ${
                    task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {task.startTime && (
                      <Tag color="blue" className="text-xs">
                        {format(task.startTime, 'HH:mm')}
                      </Tag>
                    )}
                    {task.priority && (
                      <Tag 
                        color={
                          task.priority === 'high' ? 'red' : 
                          task.priority === 'medium' ? 'orange' : 'blue'
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* AI Insights - 移动端优化 */}
      <Card 
        title={
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg font-semibold">💡 AI洞察</span>
            <Button 
              type="link" 
              size="small"
              onClick={() => navigate('/insights')}
              icon={<ArrowRightOutlined />}
            >
              查看全部
            </Button>
          </div>
        }
      >
        {insights.length === 0 ? (
          <Empty 
            description="暂无AI洞察"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className="p-3 md:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/insights')}
              >
                <div className="flex items-start gap-3">
                  <BulbOutlined className="text-purple-600 text-xl flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Tag color={insight.priority === 'high' ? 'red' : 'blue'} className="text-xs">
                        {insight.priority}
                      </Tag>
                      {!insight.isRead && (
                        <Tag color="orange" className="text-xs">未读</Tag>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions - 移动端大按钮 */}
      <Card title={<span className="text-base md:text-lg font-semibold">⚡ 快速操作</span>}>
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={12} md={6}>
            <Button
              block
              size="large"
              className="h-20 md:h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/goals')}
            >
              <TrophyOutlined className="text-2xl text-yellow-500" />
              <span className="text-xs md:text-sm">目标习惯</span>
            </Button>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Button
              block
              size="large"
              className="h-20 md:h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/analytics')}
            >
              <ThunderboltOutlined className="text-2xl text-blue-500" />
              <span className="text-xs md:text-sm">数据分析</span>
            </Button>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Button
              block
              size="large"
              className="h-20 md:h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/insights')}
            >
              <BulbOutlined className="text-2xl text-purple-500" />
              <span className="text-xs md:text-sm">AI洞察</span>
            </Button>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Button
              block
              size="large"
              className="h-20 md:h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/pricing')}
            >
              <RocketOutlined className="text-2xl text-green-500" />
              <span className="text-xs md:text-sm">升级会员</span>
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default HomePage
