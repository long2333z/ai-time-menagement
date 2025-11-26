import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, Goal, Habit, Insight, UserProfile, DailyPlan, DailyReview } from '../types'

interface AppStore {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile) => void

  // Tasks
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskStatus: (id: string) => void

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
  addInsight: (insight: Insight) => void
  markInsightAsRead: (id: string) => void
  toggleInsightFavorite: (id: string) => void

  // Utility
  clearAllData: () => void
  loadDemoData: () => void
}

// Demo data generator
const generateDemoData = () => {
  const now = new Date()

  const demoUser: UserProfile = {
    id: 'demo-user',
    name: '张小明',
    email: 'zhangxiaoming@example.com',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    occupation: '产品经理',
    workMode: 'hybrid',
    subscriptionTier: 'free',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      darkMode: false,
      voiceAutoStart: false,
      defaultPlanTime: '09:00',
      defaultReviewTime: '18:00',
      workingHours: {
        start: '09:00',
        end: '18:00',
      },
    },
    createdAt: new Date(),
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const demoTasks: Task[] = [
    {
      id: 'task-1',
      title: '早晨站会',
      description: '团队每日同步会议',
      startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 9.5 * 60 * 60 * 1000),
      duration: 30,
      priority: 'medium',
      status: 'completed',
      category: '工作',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
    },
    {
      id: 'task-2',
      title: '产品设计评审',
      description: '与团队一起评审新功能设计',
      startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 11.5 * 60 * 60 * 1000),
      duration: 90,
      priority: 'high',
      status: 'in-progress',
      category: '工作',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-3',
      title: '午餐休息',
      startTime: new Date(today.getTime() + 12 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000),
      duration: 60,
      priority: 'low',
      status: 'pending',
      category: '个人',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-4',
      title: '代码开发',
      description: '实现新的API接口',
      startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000),
      duration: 120,
      priority: 'high',
      status: 'pending',
      category: '工作',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'task-5',
      title: '团队同步',
      description: '每日收尾团队会议',
      startTime: new Date(today.getTime() + 16.5 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 17 * 60 * 60 * 1000),
      duration: 30,
      priority: 'medium',
      status: 'pending',
      category: '工作',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const demoGoals: Goal[] = [
    {
      id: 'goal-1',
      title: '完成产品上线',
      description: '月底前发布新功能',
      type: 'monthly',
      targetValue: 100,
      currentValue: 65,
      unit: '%',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      status: 'active',
      progress: 65,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'goal-2',
      title: '阅读2本书',
      description: '本季度阅读2本职业发展相关书籍',
      type: 'quarterly',
      targetValue: 2,
      currentValue: 1,
      unit: '本',
      startDate: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
      endDate: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0),
      status: 'active',
      progress: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const demoHabits: Habit[] = [
    {
      id: 'habit-1',
      title: '晨间锻炼',
      description: '每天早晨锻炼30分钟',
      frequency: 'daily',
      streak: 7,
      longestStreak: 14,
      completedDates: [new Date()],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'habit-2',
      title: '每日阅读',
      description: '睡前阅读20分钟',
      frequency: 'daily',
      streak: 3,
      longestStreak: 10,
      completedDates: [new Date()],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const demoInsights: Insight[] = [
    {
      id: 'insight-1',
      type: 'productivity',
      title: '最佳专注时段',
      description: '您的专注力在上午10点到12点之间最高。建议在这段时间安排深度工作。',
      priority: 'high',
      actionable: true,
      actionText: '预留10-12点进行专注工作',
      createdAt: new Date(),
      isRead: false,
      isFavorite: false,
    },
    {
      id: 'insight-2',
      type: 'time-management',
      title: '会议优化建议',
      description: '您今天有3个会议。考虑将它们集中安排，以保留更多专注时间。',
      priority: 'medium',
      actionable: true,
      actionText: '将会议集中安排',
      createdAt: new Date(),
      isRead: false,
      isFavorite: false,
    },
    {
      id: 'insight-3',
      type: 'general',
      title: '进步显著！',
      description: '本周您已完成75%的任务。保持这个势头！',
      priority: 'low',
      actionable: false,
      createdAt: new Date(),
      isRead: false,
      isFavorite: false,
    },
  ]

  return {
    user: demoUser,
    tasks: demoTasks,
    goals: demoGoals,
    habits: demoHabits,
    insights: demoInsights,
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      tasks: [],
      dailyPlans: [],
      dailyReviews: [],
      goals: [],
      habits: [],
      insights: [],

      // User actions
      setUser: (user) => set({ user }),

      // Task actions
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskStatus: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id) {
              const newStatus =
                task.status === 'completed'
                  ? 'pending'
                  : task.status === 'pending'
                  ? 'in-progress'
                  : 'completed'

              return {
                ...task,
                status: newStatus,
                completedAt: newStatus === 'completed' ? new Date() : undefined,
                updatedAt: new Date(),
              }
            }
            return task
          }),
        })),

      // Daily Plan actions
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

      // Daily Review actions
      addDailyReview: (review) =>
        set((state) => ({
          dailyReviews: [...state.dailyReviews, review],
        })),

      // Goal actions
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

      // Habit actions
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

      // Insight actions
      addInsight: (insight) =>
        set((state) => ({
          insights: [...state.insights, insight],
        })),

      markInsightAsRead: (id) =>
        set((state) => ({
          insights: state.insights.map((insight) =>
            insight.id === id ? { ...insight, isRead: true } : insight
          ),
        })),

      toggleInsightFavorite: (id) =>
        set((state) => ({
          insights: state.insights.map((insight) =>
            insight.id === id ? { ...insight, isFavorite: !insight.isFavorite } : insight
          ),
        })),

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
        const demoData = generateDemoData()
        set({
          user: demoData.user,
          tasks: demoData.tasks,
          goals: demoData.goals,
          habits: demoData.habits,
          insights: demoData.insights,
        })
      },
    }),
    {
      name: 'ai-time-manager-storage',
      version: 1,
    }
  )
)
