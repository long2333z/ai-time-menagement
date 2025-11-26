import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, message, Divider } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { login } from '../services/authService'

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    
    try {
      const response = await login({
        email: values.email,
        password: values.password,
      })
      
      message.success('登录成功!')
      
      // 跳转到首页
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (error: any) {
      console.error('Login failed:', error)
      message.error(error.response?.data?.detail || '登录失败,请检查邮箱和密码')
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
            AI时间管理大师
          </h1>
          <p className="text-gray-600">
            登录您的账号,开始智能时间管理
          </p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
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
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>或</Divider>

        <div className="text-center">
          <p className="text-gray-600">
            还没有账号?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              立即注册
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            登录即表示您同意我们的
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

export default LoginPage
