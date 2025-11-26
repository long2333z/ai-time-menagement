import { Card, Form, Input, Select, Switch, Button, Divider } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

const SettingsPage = () => {
  const [form] = Form.useForm()

  const handleSave = (values: any) => {
    console.log('Settings saved:', values)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <Card title="Profile Settings">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            name: '张三',
            email: 'zhangsan@example.com',
            timezone: 'Asia/Shanghai',
            language: 'zh-CN',
          }}
        >
          <Form.Item label="Full Name" name="name">
            <Input size="large" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input size="large" type="email" />
          </Form.Item>

          <Form.Item label="时区 / Timezone" name="timezone">
            <Select size="large" showSearch>
              <Select.Option value="Asia/Shanghai">中国标准时间 (UTC+8)</Select.Option>
              <Select.Option value="Asia/Hong_Kong">香港时间 (UTC+8)</Select.Option>
              <Select.Option value="Asia/Taipei">台北时间 (UTC+8)</Select.Option>
              <Select.Option value="Asia/Tokyo">东京时间 (UTC+9)</Select.Option>
              <Select.Option value="Asia/Seoul">首尔时间 (UTC+9)</Select.Option>
              <Select.Option value="Asia/Singapore">新加坡时间 (UTC+8)</Select.Option>
              <Select.Option value="America/Los_Angeles">太平洋时间 (PT)</Select.Option>
              <Select.Option value="America/Denver">山地时间 (MT)</Select.Option>
              <Select.Option value="America/Chicago">中部时间 (CT)</Select.Option>
              <Select.Option value="America/New_York">东部时间 (ET)</Select.Option>
              <Select.Option value="Europe/London">伦敦时间 (GMT)</Select.Option>
              <Select.Option value="Europe/Paris">巴黎时间 (CET)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="语言 / Language" name="language">
            <Select size="large">
              <Select.Option value="zh-CN">简体中文</Select.Option>
              <Select.Option value="zh-TW">繁體中文</Select.Option>
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="es">Español</Select.Option>
              <Select.Option value="fr">Français</Select.Option>
              <Select.Option value="ja">日本語</Select.Option>
              <Select.Option value="ko">한국어</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Preferences">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive daily summary emails</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Push Notifications</p>
              <p className="text-sm text-gray-500">Get reminders for tasks and goals</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Dark Mode</p>
              <p className="text-sm text-gray-500">Use dark theme</p>
            </div>
            <Switch />
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Voice Input Auto-start</p>
              <p className="text-sm text-gray-500">Automatically start voice recording</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      <Card title="AI服务配置">
        <div className="space-y-4">
          <p className="text-gray-600">
            配置AI服务的API密钥以启用智能功能，如语音识别、任务解析、智能洞察等
          </p>
          <Button 
            block 
            size="large" 
            type="primary"
            onClick={() => window.location.href = '/api-config'}
          >
            前往API配置中心
          </Button>
        </div>
      </Card>

      <Card title="日历集成">
        <div className="space-y-4">
          <Button block size="large">
            连接 Google 日历
          </Button>
          <Button block size="large">
            连接 Apple 日历
          </Button>
          <Button block size="large">
            连接 Outlook 日历
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button size="large">Cancel</Button>
        <Button type="primary" size="large" icon={<SaveOutlined />} onClick={() => form.submit()}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default SettingsPage
