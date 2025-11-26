import { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Typography, Empty } from 'antd'
import { DeleteOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { errorHandler, ErrorInfo, ErrorType } from '../utils/errorHandler'

const { Text, Paragraph } = Typography

const ErrorLogsPage = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorInfo[]>([])
  const [selectedError, setSelectedError] = useState<ErrorInfo | null>(null)
  const [detailsVisible, setDetailsVisible] = useState(false)

  // 加载错误日志
  const loadErrorLogs = () => {
    const logs = errorHandler.getErrorLogs()
    
    // 同时从localStorage加载
    try {
      const storedLogs = JSON.parse(localStorage.getItem('app_error_logs') || '[]')
      const allLogs = [...logs, ...storedLogs]
      
      // 去重并按时间排序
      const uniqueLogs = Array.from(
        new Map(allLogs.map(log => [log.timestamp, log])).values()
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setErrorLogs(uniqueLogs)
    } catch (e) {
      setErrorLogs(logs)
    }
  }

  useEffect(() => {
    loadErrorLogs()
  }, [])

  // 清除所有日志
  const handleClearLogs = () => {
    Modal.confirm({
      title: '确认清除',
      content: '确定要清除所有错误日志吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        errorHandler.clearErrorLogs()
        setErrorLogs([])
      },
    })
  }

  // 查看错误详情
  const handleViewDetails = (error: ErrorInfo) => {
    setSelectedError(error)
    setDetailsVisible(true)
  }

  // 获取错误类型标签颜色
  const getErrorTypeColor = (type: ErrorType): string => {
    switch (type) {
      case ErrorType.NETWORK:
        return 'orange'
      case ErrorType.API:
        return 'red'
      case ErrorType.AUTH:
        return 'purple'
      case ErrorType.VALIDATION:
        return 'gold'
      default:
        return 'default'
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString('zh-CN'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: ErrorType) => (
        <Tag color={getErrorTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '错误码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code?: string | number) => code || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ErrorInfo) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          详情
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">错误日志</h1>
          <p className="text-gray-600 mt-2">
            查看和管理应用错误日志（仅开发环境可见）
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadErrorLogs}
          >
            刷新
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearLogs}
            disabled={errorLogs.length === 0}
          >
            清除所有
          </Button>
        </Space>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Text strong>总计:</Text>
            <Tag color="blue">{errorLogs.length} 条错误</Tag>
          </Space>
          <Text type="secondary">
            最近更新: {errorLogs.length > 0 ? new Date(errorLogs[0].timestamp).toLocaleString('zh-CN') : '-'}
          </Text>
        </div>

        {errorLogs.length === 0 ? (
          <Empty
            description="暂无错误日志"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={errorLogs}
            rowKey="timestamp"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        )}
      </Card>

      {/* 错误详情Modal */}
      <Modal
        title="错误详情"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedError && (
          <div className="space-y-4">
            <div>
              <Text strong>错误类型：</Text>
              <Tag color={getErrorTypeColor(selectedError.type)} className="ml-2">
                {selectedError.type}
              </Tag>
            </div>

            <div>
              <Text strong>时间：</Text>
              <Text className="ml-2">
                {new Date(selectedError.timestamp).toLocaleString('zh-CN')}
              </Text>
            </div>

            {selectedError.code && (
              <div>
                <Text strong>错误码：</Text>
                <Text className="ml-2">{selectedError.code}</Text>
              </div>
            )}

            <div>
              <Text strong>错误信息：</Text>
              <Paragraph className="mt-2 p-3 bg-gray-50 rounded">
                {selectedError.message}
              </Paragraph>
            </div>

            {selectedError.details && (
              <div>
                <Text strong>详细信息：</Text>
                <Paragraph className="mt-2 p-3 bg-gray-50 rounded">
                  <pre className="text-xs overflow-auto max-h-96">
                    {JSON.stringify(selectedError.details, null, 2)}
                  </pre>
                </Paragraph>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Footer */}
      <div className="text-center py-4 text-gray-500 text-sm">
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

export default ErrorLogsPage
