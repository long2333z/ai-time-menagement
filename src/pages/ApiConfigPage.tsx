import { useState, useEffect } from 'react'
import { Card, Form, Input, Select, Button, message, Alert, Divider, Space, Tag } from 'antd'
import { SaveOutlined, KeyOutlined, ApiOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { saveAIConfig, getAIConfig, testAIConfig, AIConfig } from '../services/aiService'

const ApiConfigPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  // 加载已保存的配置
  useEffect(() => {
    const config = getAIConfig()
    if (config) {
      form.setFieldsValue(config)
    }
  }, [form])

  const handleSave = async (values: any) => {
    setLoading(true)
    try {
      const config: AIConfig = {
        provider: values.provider,
        apiKey: values.apiKey,
        apiEndpoint: values.apiEndpoint,
        model: values.model,
        temperature: values.temperature,
        maxTokens: values.maxTokens,
      }
      
      saveAIConfig(config)
      message.success('API配置已保存！')
    } catch (error: any) {
      message.error(error.message || '保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    const values = form.getFieldsValue()
    
    if (!values.provider || !values.apiKey) {
      message.warning('请先填写API提供商和密钥')
      return
    }

    setTestStatus('testing')
    try {
      const config: AIConfig = {
        provider: values.provider,
        apiKey: values.apiKey,
        apiEndpoint: values.apiEndpoint,
        model: values.model,
        temperature: values.temperature,
        maxTokens: values.maxTokens,
      }
      
      const success = await testAIConfig(config)
      
      if (success) {
        setTestStatus('success')
        message.success('API连接测试成功！')
      } else {
        setTestStatus('error')
        message.error('API连接测试失败')
      }
    } catch (error: any) {
      setTestStatus('error')
      message.error(error.message || 'API连接测试失败')
    }
  }

  const handleLoadSaved = () => {
    const config = getAIConfig()
    if (config) {
      form.setFieldsValue(config)
      message.success('已加载保存的配置')
    } else {
      message.info('没有找到保存的配置')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API配置中心</h1>
        <p className="text-gray-600 mt-2">配置AI服务的API密钥以启用智能功能</p>
      </div>

      <Alert
        message="关于API配置"
        description={
          <div className="space-y-2">
            <p>本应用支持多种AI服务提供商，您可以选择以下任一服务：</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>OpenAI</strong> - GPT-3.5/GPT-4，功能强大，支持多语言</li>
              <li><strong>DeepSeek</strong> - 国内服务，响应快速，价格实惠</li>
              <li><strong>Claude</strong> - Anthropic出品，擅长长文本处理</li>
              <li><strong>通义千问</strong> - 阿里云服务，中文理解优秀</li>
            </ul>
            <p className="text-sm text-gray-500 mt-2">
              💡 提示：API密钥将加密存储，仅用于调用AI服务
            </p>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      <Card title="API配置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 2000,
          }}
        >
          <Form.Item 
            label="AI服务提供商" 
            name="provider"
            rules={[{ required: true, message: '请选择AI服务提供商' }]}
          >
            <Select size="large">
              <Select.Option value="openai">
                <Space>
                  <ApiOutlined />
                  OpenAI (GPT-3.5/GPT-4)
                </Space>
              </Select.Option>
              <Select.Option value="deepseek">
                <Space>
                  <ApiOutlined />
                  DeepSeek
                </Space>
              </Select.Option>
              <Select.Option value="claude">
                <Space>
                  <ApiOutlined />
                  Claude (Anthropic)
                </Space>
              </Select.Option>
              <Select.Option value="qwen">
                <Space>
                  <ApiOutlined />
                  通义千问 (阿里云)
                </Space>
              </Select.Option>
              <Select.Option value="custom">
                <Space>
                  <ApiOutlined />
                  自定义API
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="模型名称" 
            name="model"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input 
              size="large" 
              placeholder="例如: gpt-3.5-turbo, deepseek-chat"
            />
          </Form.Item>

          <Form.Item 
            label="API密钥" 
            name="apiKey"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password 
              size="large" 
              placeholder="sk-..."
              prefix={<KeyOutlined />}
            />
          </Form.Item>

          <Form.Item 
            label="API端点 (可选)" 
            name="apiEndpoint"
            tooltip="如果使用自定义API或代理，请填写完整的API端点URL"
          >
            <Input 
              size="large" 
              placeholder="https://api.openai.com/v1"
            />
          </Form.Item>

          <Divider>高级设置</Divider>

          <Form.Item 
            label="Temperature (创造性)" 
            name="temperature"
            tooltip="控制输出的随机性，0-1之间，越高越有创造性"
          >
            <Select size="large">
              <Select.Option value={0.3}>0.3 - 保守</Select.Option>
              <Select.Option value={0.5}>0.5 - 平衡</Select.Option>
              <Select.Option value={0.7}>0.7 - 标准</Select.Option>
              <Select.Option value={0.9}>0.9 - 创造性</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="最大Token数" 
            name="maxTokens"
            tooltip="单次请求的最大token数量"
          >
            <Select size="large">
              <Select.Option value={1000}>1000</Select.Option>
              <Select.Option value={2000}>2000 (推荐)</Select.Option>
              <Select.Option value={4000}>4000</Select.Option>
              <Select.Option value={8000}>8000</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            label="优先级" 
            name="priority"
            tooltip="当配置多个API时，优先使用优先级高的"
          >
            <Select size="large">
              <Select.Option value={1}>低</Select.Option>
              <Select.Option value={5}>中</Select.Option>
              <Select.Option value={10}>高</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card title="测试连接">
        <div className="space-y-4">
          <p className="text-gray-600">
            在保存配置前，建议先测试API连接是否正常
          </p>
          
          <div className="flex gap-3">
            <Button 
              size="large" 
              icon={<ApiOutlined />}
              onClick={handleTest}
              loading={testStatus === 'testing'}
            >
              测试连接
            </Button>
            
            {testStatus === 'success' && (
              <Tag color="success" icon={<CheckCircleOutlined />} className="flex items-center">
                连接成功
              </Tag>
            )}
            
            {testStatus === 'error' && (
              <Tag color="error" className="flex items-center">
                连接失败
              </Tag>
            )}
          </div>
        </div>
      </Card>

      <Card title="已保存的配置">
        <div className="space-y-4">
          <p className="text-gray-600">
            您可以加载之前保存的API配置
          </p>
          
          <Button 
            size="large" 
            onClick={handleLoadSaved}
          >
            加载已保存的配置
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button size="large">
          取消
        </Button>
        <Button 
          type="primary" 
          size="large" 
          icon={<SaveOutlined />} 
          onClick={() => form.submit()}
          loading={loading}
        >
          保存配置
        </Button>
      </div>

      <Alert
        message="安全提示"
        description="您的API密钥将被加密存储在本地，不会上传到任何服务器。请妥善保管您的API密钥，不要分享给他人。"
        type="warning"
        showIcon
      />
    </div>
  )
}

export default ApiConfigPage
