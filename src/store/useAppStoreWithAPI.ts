import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, Goal, Habit, Insight, UserProfile, DailyPlan, DailyReview } from '../types'
import * as taskService from '../services/taskService'
import * as insightService from '../services/insightService'
import * as authService from '../services/authService'
import { message } from 'antd'

interface AppStore {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile) => void
  loadUser: () => Promise<void>

  // Tasks
  tasks: Task[]
  tasksLoading: boolean
  loadTasks: () => Promise<void>
  addTask: (task: Partial<Task>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskStatus: (id: string) => Promise<void>

  // Daily Plans
  dailyPlans: DailyPlan[]
  addDailyPlan: (plan: DailyPlan) => void
  updateDailyPlan: (id: string, updates: Partial<DailyPlan>) => void

  // Daily Reviews
  dailyReviews: DailyReview[]
  addDailyReview: (review: DailyReview) => void

  // Goals
  goals: Goal[]
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  // Habits
  habits: Habit[]
  addHabit: (habit: Habit) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  logHabitCompletion: (habitId: string, date: Date) => void

  // Insights
  insights: Insight[]
  insightsLoading: boolean
  loadInsights: () => Promise<void>
  addInsight: (insight: Partial<Insight>) => Promise<void>
  markInsightAsRead: (id: string) => Promise<void>
  toggleInsightFavorite: (id: string) => Promise<void>

  // Utility
  clearAllData: () => void
  loadDemoData: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tasks: [],
      tasksLoading: false,
      dailyPlans: [],
      dailyReviews: [],
      goals: [],
      habits: [],
      insights: [],
      insightsLoading: false,

      // User actions
      setUser: (user) => set({ user }),

      loadUser: async () => {
        try {
          const user = await authService.getCurrentUser()
          set({ user: user as any })
        } catch (error) {
          console.error('Load user failed:', error)
        }
      },

      // Task actions with API integration
      loadTasks: async () => {
        set({ tasksLoading: true })
        try {
          const tasks = await taskService.getTasks()
          set({ tasks, tasksLoading: false })
        } catch (error) {
          console.error('Load tasks failed:', error)
          set({ tasksLoading: false })
          message.error('加载任务失败')
        }
      },

      addTask: async (task) => {
        try {
          const newTask = await taskService.createTask(task)
          set((state) => ({
            tasks: [...state.tasks, newTask],
          }))
          message.success('任务创建成功')
        } catch (error) {
          console.error('Add task failed:', error)
          message.error('创建任务失败')
          throw error
        }
      },

      updateTask: async (id, updates) => {
        try {
          const updatedTask = await taskService.updateTask(id, updates)
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? updatedTask : task
            ),
          }))
          message.success('任务更新成功')
        } catch (error) {
          console.error('Update task failed:', error)
          message.error('更新任务失败')
          throw error
        }
      },

      deleteTask: async (id) => {
        try {
          await taskService.deleteTask(id)
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }))
          message.success('任务删除成功')
        } catch (error) {
          console.error('Delete task failed:', error)
          message.error('删除任务失败')
          throw error
        }
      },

      toggleTaskStatus: async (id) => {
        try {
          const task = get().tasks.find((t) => t.id === id)
          if (!task) return

          const newStatus =
            task.status === 'completed'
              ? 'pending'
              : task.status === 'pending'
              ? 'in-progress'
              : 'completed'

          await get().updateTask(id, { status: newStatus })
        } catch (error) {
          console.error('Toggle task status failed:', error)
        }
      },

      // Daily Plan actions (local only for now)
      addDailyPlan: (plan) =>
        set((state) => ({
          dailyPlans: [...state.dailyPlans, plan],
        })),

      updateDailyPlan: (id, updates) =>
        set((state) => ({
          dailyPlans: state.dailyPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updates, updatedAt: new Date() } : plan
          ),
        })),

      // Daily Review actions (local only for now)
      addDailyReview: (review) =>
        set((state) => ({
          dailyReviews: [...state.dailyReviews, review],
        })),

      // Goal actions (local only for now)
      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, goal],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates, updatedAt: new Date() } : goal
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),

      // Habit actions (local only for now)
      addHabit: (habit) =>
        set((state) => ({
          habits: [...state.habits, habit],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates, updatedAt: new Date() } : habit
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),

      logHabitCompletion: (habitId, date) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id === habitId) {
              const completedDates = [...habit.completedDates, date]
              return {
                ...habit,
                completedDates,
                streak: habit.streak + 1,
                longestStreak: Math.max(habit.longestStreak, habit.streak + 1),
                updatedAt: new Date(),
              }
            }
            return habit
          }),
        })),

      // Insight actions with API integration
      loadInsights: async () => {
        set({ insightsLoading: true })
        try {
          const insights = await insightService.getInsights()
          set({ insights, insightsLoading: false })
        } catch (error) {
          console.error('Load insights failed:', error)
          set({ insightsLoading: false })
          message.error('加载洞察失败')
        }
      },

      addInsight: async (insight) => {
        try {
          const newInsight = await insightService.createInsight(insight)
          set((state) => ({
            insights: [...state.insights, newInsight],
          }))
          message.success('洞察创建成功')
        } catch (error) {
          console.error('Add insight failed:', error)
          message.error('创建洞察失败')
          throw error
        }
      },

      markInsightAsRead: async (id) => {
        try {
          await insightService.markInsightAsRead(id)
          set((state) => ({
            insights: state.insights.map((insight) =>
              insight.id === id ? { ...insight, isRead: true } : insight
            ),
          }))
        } catch (error) {
          console.error('Mark insight as read failed:', error)
          message.error('标记已读失败')
        }
      },

      toggleInsightFavorite: async (id) => {
        try {
          const result = await insightService.toggleInsightFavorite(id)
          set((state) => ({
            insights: state.insights.map((insight) =>
              insight.id === id ? { ...insight, isFavorite: result.is_favorite } : insight
            ),
          }))
        } catch (error) {
          console.error('Toggle insight favorite failed:', error)
          message.error('切换收藏失败')
        }
      },

      // Utility actions
      clearAllData: () =>
        set({
          user: null,
          tasks: [],
          dailyPlans: [],
          dailyReviews: [],
          goals: [],
          habits: [],
          insights: [],
        }),

      loadDemoData: () => {
        // Keep demo data for offline mode
        message.info('演示数据已加载(仅本地)')
      },
    }),
    {
      name: 'ai-time-manager-storage',
      version: 2,
    }
  )
)
