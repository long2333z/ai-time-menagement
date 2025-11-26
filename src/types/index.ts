// Task related types
export interface Task {
  id: string
  title: string
  description?: string
  startTime?: Date
  endTime?: Date
  duration?: number // in minutes
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  category?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface DailyPlan {
  id: string
  date: Date
  tasks: Task[]
  voiceTranscript?: string
  createdAt: Date
  updatedAt: Date
}

export interface DailyReview {
  id: string
  date: Date
  planId: string
  voiceTranscript?: string
  completionRate: number
  totalTasks: number
  completedTasks: number
  totalTimeSpent: number // in minutes
  notes?: string
  mood?: 'great' | 'good' | 'okay' | 'bad'
  energyLevel?: number // 1-10
  createdAt: Date
}

// Goal related types
export interface Goal {
  id: string
  title: string
  description?: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  targetValue?: number
  currentValue?: number
  unit?: string
  startDate: Date
  endDate: Date
  status: 'active' | 'completed' | 'cancelled' | 'paused'
  progress: number // 0-100
  createdAt: Date
  updatedAt: Date
}

// Habit related types
export interface Habit {
  id: string
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetDays?: number[] // 0-6 for days of week
  streak: number
  longestStreak: number
  completedDates: Date[]
  createdAt: Date
  updatedAt: Date
}

export interface HabitLog {
  id: string
  habitId: string
  date: Date
  completed: boolean
  notes?: string
}

// Insight related types
export interface Insight {
  id: string
  type: 'productivity' | 'time-management' | 'energy' | 'habit' | 'goal' | 'general' | 'health'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  actionText?: string
  createdAt: Date
  isRead: boolean
  isFavorite: boolean
}

// Analytics related types
export interface TimeDistribution {
  category: string
  duration: number // in minutes
  percentage: number
  color?: string
}

export interface ProductivityMetrics {
  date: Date
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalTimeSpent: number
  focusTime: number
  breakTime: number
  energyLevel?: number
}

export interface EnergyPattern {
  hour: number
  energyLevel: number
  productivity: number
}

// User related types
export interface UserProfile {
  id: string
  name: string
  email: string
  timezone: string
  language: string
  occupation?: string
  workMode?: 'office' | 'remote' | 'hybrid'
  subscriptionTier: 'free' | 'premium' | 'pro'
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date
  preferences: UserPreferences
  createdAt: Date
}

export interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  darkMode: boolean
  voiceAutoStart: boolean
  defaultPlanTime?: string // HH:mm format
  defaultReviewTime?: string // HH:mm format
  workingHours?: {
    start: string // HH:mm
    end: string // HH:mm
  }
}

// Subscription related types
export interface SubscriptionPlan {
  id: string
  name: 'Free' | 'Premium' | 'Pro'
  price: number
  period: 'month' | 'year'
  features: string[]
  limits: {
    voiceMinutesPerDay?: number
    insightsPerDay?: number
    historyDays?: number
    calendarSync?: 'one-way' | 'two-way' | 'none'
  }
}

// Referral related types
export interface Referral {
  id: string
  referrerId: string
  referredUserId?: string
  referralCode: string
  status: 'pending' | 'completed' | 'rewarded'
  reward?: string
  createdAt: Date
  completedAt?: Date
}

// Achievement related types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  type: 'task' | 'goal' | 'habit' | 'streak' | 'referral'
  requirement: number
  progress: number
  unlocked: boolean
  unlockedAt?: Date
}

// Notification related types
export interface Notification {
  id: string
  type: 'reminder' | 'achievement' | 'insight' | 'system'
  title: string
  message: string
  actionUrl?: string
  isRead: boolean
  createdAt: Date
}

// App State types
export interface AppState {
  user: UserProfile | null
  tasks: Task[]
  dailyPlans: DailyPlan[]
  dailyReviews: DailyReview[]
  goals: Goal[]
  habits: Habit[]
  insights: Insight[]
  achievements: Achievement[]
  notifications: Notification[]
  isLoading: boolean
  error: string | null
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export interface TaskFormData {
  title: string
  description?: string
  startTime?: string
  duration?: number
  priority: 'high' | 'medium' | 'low'
  category?: string
}

export interface GoalFormData {
  title: string
  description?: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  targetValue?: number
  unit?: string
  endDate: string
}

export interface HabitFormData {
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetDays?: number[]
}
