import { Card, Tag, Button, Tooltip, Empty } from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { Task } from '../types'
import { format } from 'date-fns'

interface TaskTimelineProps {
  tasks: Task[]
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onToggleStatus?: (taskId: string) => void
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
}) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      case 'low':
        return 'blue'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'in-progress':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />
      case 'cancelled':
        return <ExclamationCircleOutlined style={{ color: '#d9d9d9' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Pending'
    }
  }

  // Sort tasks by start time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.startTime) return 1
    if (!b.startTime) return -1
    const aTime = new Date(a.startTime).getTime()
    const bTime = new Date(b.startTime).getTime()
    return aTime - bTime
  })

  // Group tasks by time slot
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    const key = task.startTime ? format(new Date(task.startTime), 'HH:00') : 'Unscheduled'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  if (tasks.length === 0) {
    return (
      <Card>
        <Empty
          description="No tasks yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedTasks).map(([timeSlot, tasksInSlot]) => (
        <div key={timeSlot}>
          <div className="flex items-center gap-2 mb-3">
            <ClockCircleOutlined className="text-primary-600" />
            <span className="font-semibold text-gray-700">{timeSlot}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-3 ml-6">
            {tasksInSlot.map((task) => (
              <Card
                key={task.id}
                size="small"
                className={`
                  transition-all hover:shadow-md
                  ${task.status === 'completed' ? 'opacity-60' : ''}
                  ${task.priority === 'high' ? 'border-l-4 border-l-red-500' : ''}
                  ${task.priority === 'medium' ? 'border-l-4 border-l-orange-500' : ''}
                  ${task.priority === 'low' ? 'border-l-4 border-l-blue-500' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => onToggleStatus?.(task.id)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <h4
                        className={`font-semibold text-base ${
                          task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {task.startTime && task.endTime && (
                        <Tag icon={<ClockCircleOutlined />} color="blue">
                          {format(new Date(task.startTime), 'HH:mm')} - {format(new Date(task.endTime), 'HH:mm')}
                        </Tag>
                      )}

                      {task.duration && (
                        <Tag color="cyan">{task.duration} min</Tag>
                      )}

                      <Tag color={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Tag>

                      {task.category && (
                        <Tag color="purple">{task.category}</Tag>
                      )}

                      {task.tags?.map((tag) => (
                        <Tag key={tag} color="default">
                          #{tag}
                        </Tag>
                      ))}

                      <Tag color={task.status === 'completed' ? 'success' : 'default'}>
                        {getStatusText(task.status)}
                      </Tag>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {onEditTask && (
                      <Tooltip title="Edit">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEditTask(task)}
                        />
                      </Tooltip>
                    )}
                    {onDeleteTask && (
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => onDeleteTask(task.id)}
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskTimeline
