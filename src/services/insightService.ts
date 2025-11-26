import { request } from './apiClient'
import { Insight } from '../types'

// 洞察创建请求
export interface InsightCreateRequest {
  type: string
  title: string
  description: string
  priority?: 'high' | 'medium' | 'low'
  actionable?: boolean
  action_text?: string
}

// 洞察响应
export interface InsightResponse {
  id: string
  type: string
  title: string
  description: string
  priority: string
  actionable: boolean
  action_text?: string
  is_read: boolean
  is_favorite: boolean
  created_at: string
}

// 洞察查询参数
export interface InsightQueryParams {
  skip?: number
  limit?: number
  is_read?: boolean
  is_favorite?: boolean
}

/**
 * 将后端响应转换为前端Insight类型
 */
const convertToInsight = (response: InsightResponse): Insight => {
  return {
    id: response.id,
    type: response.type as Insight['type'],
    title: response.title,
    description: response.description,
    priority: response.priority as Insight['priority'],
    actionable: response.actionable,
    actionText: response.action_text,
    isRead: response.is_read,
    isFavorite: response.is_favorite,
    createdAt: new Date(response.created_at),
  }
}

/**
 * 将前端Insight转换为后端请求格式
 */
const convertToRequest = (insight: Partial<Insight>): InsightCreateRequest => {
  return {
    type: insight.type || 'general',
    title: insight.title || '',
    description: insight.description || '',
    priority: insight.priority,
    actionable: insight.actionable,
    action_text: insight.actionText,
  }
}

/**
 * 获取洞察列表
 */
export const getInsights = async (params?: InsightQueryParams): Promise<Insight[]> => {
  try {
    const response = await request.get<InsightResponse[]>('/insights', params)
    return response.map(convertToInsight)
  } catch (error) {
    console.error('Get insights error:', error)
    throw error
  }
}

/**
 * 获取未读洞察
 */
export const getUnreadInsights = async (): Promise<Insight[]> => {
  try {
    return await getInsights({ is_read: false })
  } catch (error) {
    console.error('Get unread insights error:', error)
    throw error
  }
}

/**
 * 获取收藏的洞察
 */
export const getFavoriteInsights = async (): Promise<Insight[]> => {
  try {
    return await getInsights({ is_favorite: true })
  } catch (error) {
    console.error('Get favorite insights error:', error)
    throw error
  }
}

/**
 * 创建洞察
 */
export const createInsight = async (insight: Partial<Insight>): Promise<Insight> => {
  try {
    const requestData = convertToRequest(insight)
    const response = await request.post<InsightResponse>('/insights', requestData)
    return convertToInsight(response)
  } catch (error) {
    console.error('Create insight error:', error)
    throw error
  }
}

/**
 * 标记洞察为已读
 */
export const markInsightAsRead = async (insightId: string): Promise<void> => {
  try {
    await request.put(`/insights/${insightId}/read`)
  } catch (error) {
    console.error('Mark insight as read error:', error)
    throw error
  }
}

/**
 * 切换洞察收藏状态
 */
export const toggleInsightFavorite = async (insightId: string): Promise<{ is_favorite: boolean }> => {
  try {
    const response = await request.put<{ message: string; is_favorite: boolean }>(
      `/insights/${insightId}/favorite`
    )
    return { is_favorite: response.is_favorite }
  } catch (error) {
    console.error('Toggle insight favorite error:', error)
    throw error
  }
}

/**
 * 批量标记洞察为已读
 */
export const markMultipleInsightsAsRead = async (insightIds: string[]): Promise<void> => {
  try {
    await Promise.all(insightIds.map(id => markInsightAsRead(id)))
  } catch (error) {
    console.error('Mark multiple insights as read error:', error)
    throw error
  }
}

/**
 * 获取洞察统计
 */
export const getInsightStats = async (): Promise<{
  total: number
  unread: number
  favorites: number
}> => {
  try {
    const [allInsights, unreadInsights, favoriteInsights] = await Promise.all([
      getInsights(),
      getUnreadInsights(),
      getFavoriteInsights(),
    ])
    
    return {
      total: allInsights.length,
      unread: unreadInsights.length,
      favorites: favoriteInsights.length,
    }
  } catch (error) {
    console.error('Get insight stats error:', error)
    throw error
  }
}
