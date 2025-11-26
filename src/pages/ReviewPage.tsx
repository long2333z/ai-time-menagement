import { Card, Button, Empty } from 'antd'
import { AudioOutlined } from '@ant-design/icons'

const ReviewPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌙 晚间复盘</h1>
          <p className="text-gray-600 mt-2">用2分钟回顾你的一天</p>
        </div>
        <Button type="primary" size="large" icon={<AudioOutlined />}>
          开始语音复盘
        </Button>
      </div>

      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="今日还没有复盘记录"
        >
          <Button type="primary" icon={<AudioOutlined />}>
            开始复盘
          </Button>
        </Empty>
      </Card>

      {/* Footer signature */}
      <div className="text-center py-4 text-gray-500 text-sm">
        <p>由 <a href="https://with.woa.com/" style={{ color: '#8A2BE2' }} target="_blank" rel="noopener noreferrer">with</a> 通过自然语言生成</p>
      </div>
    </div>
  )
}

export default ReviewPage
