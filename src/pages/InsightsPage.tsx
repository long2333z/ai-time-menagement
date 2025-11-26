import { Card, Empty, Badge, Tabs, Tag, Button } from 'antd'
import { 
  BulbOutlined, 
  FireOutlined, 
  ThunderboltOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  RocketOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../store/useAppStore'

const InsightsPage = () => {
  const { insights, markInsightAsRead, toggleInsightFavorite } = useAppStore()

  const unreadInsights = insights.filter(i => !i.isRead)
  const favoriteInsights = insights.filter(i => i.isFavorite)
  
  // Group insights by type
  const insightsByType = insights.reduce((acc, insight) => {
    const type = insight.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(insight)
    return acc
  }, {} as Record<string, typeof insights>)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'productivity':
        return <RocketOutlined />
      case 'time-management':
        return <ClockCircleOutlined />
      case 'energy':
        return <FireOutlined />
      case 'health':
        return <HeartOutlined />
      default:
        return <BulbOutlined />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'productivity':
        return 'blue'
      case 'time-management':
        return 'purple'
      case 'energy':
        return 'orange'
      case 'health':
        return 'green'
      case 'habit':
        return 'cyan'
      case 'goal':
        return 'gold'
      default:
        return 'default'
    }
  }

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      'productivity': '效率提升',
      'time-management': '时间管理',
      'energy': '精力管理',
      'health': '健康建议',
      'habit': '习惯养成',
      'goal': '目标达成',
      'general': '综合建议',
    }
    return names[type] || type
  }

  const renderInsightCard = (insight: typeof insights[0]) => (
    <Card
      key={insight.id}
      className={`mb-4 hover:shadow-lg transition-all ${
        !insight.isRead ? 'border-l-4 border-l-primary-500' : ''
      }`}
      onClick={() => !insight.isRead && markInsightAsRead(insight.id)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getTypeIcon(insight.type)}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {insight.title}
            </h3>
            {!insight.isRead && (
              <Badge status="processing" text="新" />
            )}
          </div>
          
          <p className="text-gray-600 mb-3 leading-relaxed whitespace-pre-line">
            {insight.description}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Tag color={getTypeColor(insight.type)}>
              {getTypeName(insight.type)}
            </Tag>
            <Tag color={insight.priority === 'high' ? 'red' : insight.priority === 'medium' ? 'orange' : 'blue'}>
              {insight.priority === 'high' ? '高优先级' : insight.priority === 'medium' ? '中优先级' : '低优先级'}
            </Tag>
            {insight.actionable && (
              <Tag color="green" icon={<ThunderboltOutlined />}>
                可执行
              </Tag>
            )}
          </div>
          
          {insight.actionable && insight.actionText && (
            <div className="mt-3">
              <Button type="primary" size="small" ghost>
                {insight.actionText}
              </Button>
            </div>
          )}
        </div>
        
        <div>
          <Button
            type="text"
            icon={<StarOutlined style={{ color: insight.isFavorite ? '#faad14' : undefined }} />}
            onClick={(e) => {
              e.stopPropagation()
              toggleInsightFavorite(insight.id)
            }}
          />
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          💡 AI洞察 <Badge count={unreadInsights.length} className="ml-2" />
        </h1>
        <p className="text-gray-600 mt-2">
          基于你的任务和行为模式，AI为你提供个性化的时间管理建议
        </p>
      </div>

      {insights.length === 0 ? (
        <Card>
          <Empty
            image={<BulbOutlined style={{ fontSize: 64, color: '#8b5cf6' }} />}
            description={
              <div className="text-center">
                <p className="text-lg mb-2">开始使用应用后将获得AI洞察</p>
                <p className="text-gray-500">
                  AI会分析你的任务安排，识别暗时间，提供效率优化建议
                </p>
              </div>
            }
          />
        </Card>
      ) : (
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: (
                <span>
                  <BulbOutlined /> 全部洞察 ({insights.length})
                </span>
              ),
              children: (
                <div>
                  {insights.length > 0 ? (
                    insights.map(renderInsightCard)
                  ) : (
                    <Empty description="暂无洞察" />
                  )}
                </div>
              ),
            },
            {
              key: 'unread',
              label: (
                <span>
                  <FireOutlined /> 未读 ({unreadInsights.length})
                </span>
              ),
              children: (
                <div>
                  {unreadInsights.length > 0 ? (
                    unreadInsights.map(renderInsightCard)
                  ) : (
                    <Empty description="没有未读洞察" />
                  )}
                </div>
              ),
            },
            {
              key: 'favorite',
              label: (
                <span>
                  <StarOutlined /> 收藏 ({favoriteInsights.length})
                </span>
              ),
              children: (
                <div>
                  {favoriteInsights.length > 0 ? (
                    favoriteInsights.map(renderInsightCard)
                  ) : (
                    <Empty description="还没有收藏的洞察" />
                  )}
                </div>
              ),
            },
            ...Object.entries(insightsByType).map(([type, typeInsights]) => ({
              key: type,
              label: (
                <span>
                  {getTypeIcon(type)} {getTypeName(type)} ({typeInsights.length})
                </span>
              ),
              children: (
                <div>
                  {typeInsights.map(renderInsightCard)}
                </div>
              ),
            })),
          ]}
        />
      )}

      {/* Feature explanation */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">🧠 AI洞察能为你做什么？</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-semibold mb-1">暗时间挖掘</h4>
              <p className="text-sm text-gray-600">
                识别通勤、等待等可利用时间，建议并行任务，提升时间利用率
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold mb-1">用户画像分析</h4>
              <p className="text-sm text-gray-600">
                基于任务类型识别你的身份和工作风格，提供针对性建议
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl mb-2">🔧</div>
              <h4 className="font-semibold mb-1">工具和方法推荐</h4>
              <p className="text-sm text-gray-600">
                推荐适合你场景的工具、APP和时间管理方法
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-semibold mb-1">工作生活平衡</h4>
              <p className="text-sm text-gray-600">
                监测工作强度，提醒休息和运动，保持健康状态
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default InsightsPage
