import { Card, Button, Empty, Tabs } from 'antd'
import { PlusOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons'

const GoalsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals & Habits</h1>
          <p className="text-gray-600 mt-2">Track your long-term goals and daily habits</p>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />}>
          Add Goal
        </Button>
      </div>

      <Card>
        <Tabs
          items={[
            {
              key: 'goals',
              label: (
                <span>
                  <TrophyOutlined /> Goals
                </span>
              ),
              children: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No goals set yet"
                >
                  <Button type="primary" icon={<PlusOutlined />}>
                    Set Your First Goal
                  </Button>
                </Empty>
              ),
            },
            {
              key: 'habits',
              label: (
                <span>
                  <FireOutlined /> Habits
                </span>
              ),
              children: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No habits tracked yet"
                >
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add Your First Habit
                  </Button>
                </Empty>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default GoalsPage
