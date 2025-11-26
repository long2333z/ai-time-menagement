import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, message, Divider, Select } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, GlobalOutlined } from '@ant-design/icons'
import { register } from '../services/authService'

const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleRegister = async (values: {
    name: string
    email: string
    password: string
    confirmPassword: string
    timezone: string
    language: string
  }) => {
    setLoading(true)
    
    try {
      const response = await register({
        name: values.name,
        email: values.email,
        password: values.password,
        timezone: values.timezone,
        language: values.language,
      })
      
      message.success('注册成功!正在跳转...')
      
      // 跳转到首页
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (error: any) {
      console.error('Register failed:', error)
      const errorMessage = error.response?.data?.detail || '注册失败,请稍后重试'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            创建账号
          </h1>
          <p className="text-gray-600">
            开始您的智能时间管理之旅
          </p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          size="large"
          initialValues={{
            timezone: 'Asia/Shanghai',
            language: 'zh-CN',
          }}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, message: '请输入您的姓名' },
              { min: 2, message: '姓名至少2个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入您的姓名"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码(至少6个字符)"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item name="timezone" label="时区">
            <Select
              showSearch
              placeholder="选择您的时区"
              suffixIcon={<GlobalOutlined />}
            >
              <Select.Option value="Asia/Shanghai">中国标准时间 (UTC+8)</Select.Option>
              <Select.Option value="Asia/Hong_Kong">香港时间 (UTC+8)</Select.Option>
              <Select.Option value="Asia/Taipei">台北时间 (UTC+8)</Select.Option>
              <Select.Option value="Asia/Tokyo">东京时间 (UTC+9)</Select.Option>
              <Select.Option value="Asia/Seoul">首尔时间 (UTC+9)</Select.Option>
              <Select.Option value="Asia/Singapore">新加坡时间 (UTC+8)</Select.Option>
              <Select.Option value="America/Los_Angeles">太平洋时间 (PT)</Select.Option>
              <Select.Option value="America/New_York">东部时间 (ET)</Select.Option>
              <Select.Option value="Europe/London">伦敦时间 (GMT)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="language" label="语言">
            <Select placeholder="选择您的语言">
              <Select.Option value="zh-CN">简体中文</Select.Option>
              <Select.Option value="zh-TW">繁體中文</Select.Option>
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="ja">日本語</Select.Option>
              <Select.Option value="ko">한국어</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>或</Divider>

        <div className="text-center">
          <p className="text-gray-600">
            已有账号?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              立即登录
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            注册即表示您同意我们的
            <a href="#" className="text-primary-600 hover:underline mx-1">
              服务条款
            </a>
            和
            <a href="#" className="text-primary-600 hover:underline mx-1">
              隐私政策
            </a>
          </p>
        </div>
      </Card>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-sm text-gray-500">
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

export default RegisterPage
