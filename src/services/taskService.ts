import { request } from './apiClient'
import { Task } from '../types'

// 任务创建请求
export interface TaskCreateRequest {
  title: string
  description?: string
  start_time?: string // ISO 8601格式
  end_time?: string
  duration?: number
  priority?: 'high' | 'medium' | 'low'
  category?: string
  tags?: string[]
}

// 任务更新请求
export interface TaskUpdateRequest {
  title?: string
  description?: string
  start_time?: string
  end_time?: string
  duration?: number
  priority?: 'high' | 'medium' | 'low'
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  category?: string
  tags?: string[]
}

// 任务响应
export interface TaskResponse {
  id: string
  title: string
  description?: string
  start_time?: string
  end_time?: string
  duration?: number
  priority: string
  status: string
  category?: string
  tags?: string[]
  created_at: string
  updated_at: string
  completed_at?: string
}

// 任务查询参数
export interface TaskQueryParams {
  skip?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
}

/**
 * 将后端响应转换为前端Task类型
 */
const convertToTask = (response: TaskResponse): Task => {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    startTime: response.start_time ? new Date(response.start_time) : undefined,
    endTime: response.end_time ? new Date(response.end_time) : undefined,
    duration: response.duration,
    priority: response.priority as Task['priority'],
    status: response.status as Task['status'],
    category: response.category,
    tags: response.tags,
    createdAt: new Date(response.created_at),
    updatedAt: new Date(response.updated_at),
    completedAt: response.completed_at ? new Date(response.completed_at) : undefined,
  }
}

/**
 * 将前端Task转换为后端请求格式
 */
const convertToRequest = (task: Partial<Task>): TaskCreateRequest | TaskUpdateRequest => {
  return {
    title: task.title,
    description: task.description,
    start_time: task.startTime?.toISOString(),
    end_time: task.endTime?.toISOString(),
    duration: task.duration,
    priority: task.priority,
    category: task.category,
    tags: task.tags,
  }
}

/**
 * 获取任务列表
 */
export const getTasks = async (params?: TaskQueryParams): Promise<Task[]> => {
  try {
    const response = await request.get<TaskResponse[]>('/tasks', params)
    return response.map(convertToTask)
  } catch (error) {
    console.error('Get tasks error:', error)
    throw error
  }
}

/**
 * 获取单个任务
 */
export const getTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await request.get<TaskResponse>(`/tasks/${taskId}`)
    return convertToTask(response)
  } catch (error) {
    console.error('Get task error:', error)
    throw error
  }
}

/**
 * 创建任务
 */
export const createTask = async (task: Partial<Task>): Promise<Task> => {
  try {
    const requestData = convertToRequest(task) as TaskCreateRequest
    const response = await request.post<TaskResponse>('/tasks', requestData)
    return convertToTask(response)
  } catch (error) {
    console.error('Create task error:', error)
    throw error
  }
}

/**
 * 批量创建任务
 */
export const createTasksBatch = async (tasks: Partial<Task>[]): Promise<Task[]> => {
  try {
    const requestData = tasks.map(task => convertToRequest(task) as TaskCreateRequest)
    const response = await request.post<TaskResponse[]>('/tasks/batch', requestData)
    return response.map(convertToTask)
  } catch (error) {
    console.error('Create tasks batch error:', error)
    throw error
  }
}

/**
 * 更新任务
 */
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  try {
    const requestData = convertToRequest(updates) as TaskUpdateRequest
    const response = await request.put<TaskResponse>(`/tasks/${taskId}`, requestData)
    return convertToTask(response)
  } catch (error) {
    console.error('Update task error:', error)
    throw error
  }
}

/**
 * 删除任务
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await request.delete(`/tasks/${taskId}`)
  } catch (error) {
    console.error('Delete task error:', error)
    throw error
  }
}

/**
 * 切换任务状态
 */
export const toggleTaskStatus = async (taskId: string, currentStatus: Task['status']): Promise<Task> => {
  try {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    return await updateTask(taskId, { status: newStatus })
  } catch (error) {
    console.error('Toggle task status error:', error)
    throw error
  }
}

/**
 * 标记任务为完成
 */
export const completeTask = async (taskId: string): Promise<Task> => {
  try {
    return await updateTask(taskId, { status: 'completed' })
  } catch (error) {
    console.error('Complete task error:', error)
    throw error
  }
}

/**
 * 标记任务为进行中
 */
export const startTask = async (taskId: string): Promise<Task> => {
  try {
    return await updateTask(taskId, { status: 'in-progress' })
  } catch (error) {
    console.error('Start task error:', error)
    throw error
  }
}
