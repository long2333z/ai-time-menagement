import { Card, Row, Col, Statistic, Empty } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons'

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 数据分析</h1>
        <p className="text-gray-600 mt-2">追踪你的效率和时间使用情况</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总任务数"
              value={0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已完成"
              value={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="完成率"
              value={0}
              suffix="%"
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="时间分配">
        <Empty description="暂无数据。开始规划任务后即可查看分析！" />
      </Card>

      {/* Footer signature */}
      <div className="text-center py-4 text-gray-500 text-sm">
        <p>由 <a href="https://with.woa.com/" style={{ color: '#8A2BE2' }} target="_blank" rel="noopener noreferrer">with</a> 通过自然语言生成</p>
      </div>
    </div>
  )
}

export default AnalyticsPage
