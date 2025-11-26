import { Task } from '../types'
import { add, set, addDays, addWeeks, startOfDay } from 'date-fns'

interface ParsedTask {
  title: string
  description?: string
  startTime?: Date
  duration?: number
  priority: 'high' | 'medium' | 'low'
  category?: string
  tags?: string[]
}

// 优先级关键词（中文）
const HIGH_PRIORITY_KEYWORDS = [
  '紧急', '重要', '优先', '必须', '务必', '赶紧', '马上', '立即', '尽快',
  '截止', 'deadline', '关键', '核心', '急', 'asap'
]

const LOW_PRIORITY_KEYWORDS = [
  '可选', '有空', '闲时', '随便', '看情况', '不急', '慢慢', '有时间',
  '考虑', '想想', '或许', '可能'
]

// 时间关键词
const TIME_KEYWORDS: Record<string, { start: number, end: number }> = {
  '早上': { start: 6, end: 9 },
  '上午': { start: 9, end: 12 },
  '中午': { start: 12, end: 13 },
  '下午': { start: 13, end: 18 },
  '傍晚': { start: 18, end: 19 },
  '晚上': { start: 19, end: 22 },
  '深夜': { start: 22, end: 24 },
  'morning': { start: 9, end: 12 },
  'afternoon': { start: 13, end: 17 },
  'evening': { start: 18, end: 21 },
  'night': { start: 21, end: 23 },
}

// 时长关键词（分钟）
const DURATION_KEYWORDS: Record<string, number> = {
  '快速': 15,
  '简短': 20,
  '短暂': 30,
  '半小时': 30,
  '一小时': 60,
  '1小时': 60,
  '两小时': 120,
  '2小时': 120,
  '半天': 240,
  '一天': 480,
  '全天': 480,
}

// 分类关键词
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '工作': ['会议', '开会', '汇报', '项目', '任务', '邮件', '电话', '客户', '方案', '文档', '报告'],
  '学习': ['学习', '阅读', '看书', '课程', '培训', '研究', '练习', '复习', '预习', '作业'],
  '个人': ['购物', '理发', '洗衣', '打扫', '整理', '收拾', '家务', '办事', '缴费'],
  '健康': ['运动', '健身', '跑步', '瑜伽', '游泳', '锻炼', '体检', '看病', '医院', '休息', '睡觉'],
  '社交': ['聚餐', '约会', '见面', '聊天', '聚会', '活动', '朋友', '家人', '吃饭', '喝茶', '咖啡'],
  '娱乐': ['电影', '游戏', '音乐', '旅游', '逛街', '散步', '放松', '娱乐'],
}

/**
 * 解析中文自然语言为任务列表
 */
export function parseChineseTranscript(transcript: string): Task[] {
  const sentences = splitChineseSentences(transcript)
  const tasks: Task[] = []

  sentences.forEach((sentence, index) => {
    const parsedTask = parseChineseSentence(sentence)
    if (parsedTask) {
      const task: Task = {
        id: `task-${Date.now()}-${index}`,
        title: parsedTask.title,
        description: parsedTask.description,
        startTime: parsedTask.startTime,
        endTime: parsedTask.startTime && parsedTask.duration
          ? add(parsedTask.startTime, { minutes: parsedTask.duration })
          : undefined,
        duration: parsedTask.duration,
        priority: parsedTask.priority,
        status: 'pending',
        category: parsedTask.category,
        tags: parsedTask.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      tasks.push(task)
    }
  })

  return tasks
}

/**
 * 分割中文句子
 */
function splitChineseSentences(text: string): string[] {
  // 按标点符号和连接词分割
  const sentences = text
    .split(/[。！？；，]|然后|接着|之后|再|还要|另外|以及/)
    .map(s => s.trim())
    .filter(s => s.length > 3)

  return sentences
}

/**
 * 解析单个中文句子
 */
function parseChineseSentence(sentence: string): ParsedTask | null {
  // 动词关键词
  const actionVerbs = [
    '做', '完成', '处理', '开', '参加', '进行', '准备', '写', '看', '读',
    '学', '练', '复习', '整理', '安排', '计划', '讨论', '沟通', '联系',
    '发送', '提交', '审核', '检查', '测试', '修改', '更新', '优化'
  ]

  const hasActionVerb = actionVerbs.some(verb => sentence.includes(verb))
  const hasTaskIndicator = sentence.includes('要') || sentence.includes('需要') || 
                           sentence.includes('得') || sentence.includes('应该')

  if (!hasActionVerb && !hasTaskIndicator) {
    return null
  }

  // 提取任务标题
  const title = cleanChineseTaskTitle(sentence)

  // 提取时间
  const startTime = extractChineseTime(sentence)

  // 提取时长
  const duration = extractChineseDuration(sentence)

  // 判断优先级
  const priority = determineChinesePriority(sentence)

  // 判断分类
  const category = determineChineseCategory(sentence)

  // 提取标签
  const tags = extractChineseTags(sentence)

  return {
    title,
    startTime,
    duration,
    priority,
    category,
    tags,
  }
}

/**
 * 清理中文任务标题
 */
function cleanChineseTaskTitle(sentence: string): string {
  let title = sentence
    .replace(/^(我要|我需要|我得|我应该|需要|要|得|应该)\s*/g, '')
    .replace(/\s*(在|于|到)\s*\d+/g, '')
    .replace(/\s*(早上|上午|中午|下午|晚上|明天|后天)/g, '')
    .trim()

  // 首字母大写
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1)
  }

  return title || sentence
}

/**
 * 提取中文时间表达
 */
function extractChineseTime(sentence: string): Date | undefined {
  const now = new Date()
  let baseDate = startOfDay(now)

  // 检查日期关键词
  if (sentence.includes('明天')) {
    baseDate = addDays(baseDate, 1)
  } else if (sentence.includes('后天')) {
    baseDate = addDays(baseDate, 2)
  } else if (sentence.includes('下周')) {
    baseDate = addWeeks(baseDate, 1)
  }

  // 检查具体时间（如：9点、下午3点、15:30）
  const timePatterns = [
    /(\d{1,2})\s*[点时]/,  // 9点、9时
    /(\d{1,2}):(\d{2})/,   // 9:30
    /(\d{1,2})点(\d{1,2})分?/, // 9点30分
  ]

  for (const pattern of timePatterns) {
    const match = sentence.match(pattern)
    if (match) {
      let hours = parseInt(match[1])
      const minutes = match[2] ? parseInt(match[2]) : 0

      // 判断上午下午
      if (sentence.includes('下午') || sentence.includes('晚上')) {
        if (hours < 12) hours += 12
      } else if (sentence.includes('早上') || sentence.includes('上午')) {
        if (hours === 12) hours = 0
      }

      return set(baseDate, { hours, minutes, seconds: 0, milliseconds: 0 })
    }
  }

  // 检查时段关键词
  for (const [period, times] of Object.entries(TIME_KEYWORDS)) {
    if (sentence.includes(period)) {
      return set(baseDate, { 
        hours: times.start, 
        minutes: 0, 
        seconds: 0, 
        milliseconds: 0 
      })
    }
  }

  return undefined
}

/**
 * 提取中文时长
 */
function extractChineseDuration(sentence: string): number | undefined {
  // 检查明确的时长表达
  const durationPatterns = [
    /(\d+)\s*分钟/,
    /(\d+)\s*小时/,
    /(\d+)\s*个?小时/,
  ]

  for (const pattern of durationPatterns) {
    const match = sentence.match(pattern)
    if (match) {
      const value = parseInt(match[1])
      if (pattern.source.includes('小时')) {
        return value * 60
      }
      return value
    }
  }

  // 检查时长关键词
  for (const [keyword, minutes] of Object.entries(DURATION_KEYWORDS)) {
    if (sentence.includes(keyword)) {
      return minutes
    }
  }

  // 根据任务类型推断默认时长
  if (sentence.includes('会议') || sentence.includes('开会')) {
    return 60
  } else if (sentence.includes('电话') || sentence.includes('沟通')) {
    return 30
  }

  return 60 // 默认1小时
}

/**
 * 判断中文优先级
 */
function determineChinesePriority(sentence: string): 'high' | 'medium' | 'low' {
  if (HIGH_PRIORITY_KEYWORDS.some(keyword => sentence.includes(keyword))) {
    return 'high'
  }

  if (LOW_PRIORITY_KEYWORDS.some(keyword => sentence.includes(keyword))) {
    return 'low'
  }

  return 'medium'
}

/**
 * 判断中文分类
 */
function determineChineseCategory(sentence: string): string | undefined {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => sentence.includes(keyword))) {
      return category
    }
  }

  return undefined
}

/**
 * 提取中文标签
 */
function extractChineseTags(sentence: string): string[] {
  const tags: string[] = []

  // 提取#标签
  const hashtagRegex = /#([\u4e00-\u9fa5\w]+)/g
  const hashtags = sentence.match(hashtagRegex)
  if (hashtags) {
    tags.push(...hashtags.map(tag => tag.substring(1)))
  }

  return tags
}

/**
 * 生成中文任务建议
 */
export function generateChineseTaskSuggestions(tasks: Task[]): string[] {
  const suggestions: string[] = []

  // 检查时间冲突
  const sortedTasks = tasks
    .filter(t => t.startTime && t.endTime)
    .sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime())

  for (let i = 0; i < sortedTasks.length - 1; i++) {
    const current = sortedTasks[i]
    const next = sortedTasks[i + 1]

    if (current.endTime && next.startTime && current.endTime > next.startTime) {
      suggestions.push(`⚠️ 时间冲突：「${current.title}」与「${next.title}」时间重叠`)
    }
  }

  // 检查高优先级任务数量
  const highPriorityCount = tasks.filter(t => t.priority === 'high').length
  if (highPriorityCount > 3) {
    suggestions.push(`💡 你有${highPriorityCount}个高优先级任务，建议聚焦最重要的3个，避免精力分散`)
  }

  // 检查未安排时间的任务
  const noTimeCount = tasks.filter(t => !t.startTime).length
  if (noTimeCount > 0) {
    suggestions.push(`📅 有${noTimeCount}个任务未安排具体时间，建议为它们分配时间块以提高执行率`)
  }

  // 检查工作生活平衡
  const workTasks = tasks.filter(t => t.category === '工作').length
  const personalTasks = tasks.filter(t => 
    t.category === '个人' || t.category === '健康' || t.category === '娱乐'
  ).length

  if (workTasks > 5 && personalTasks === 0) {
    suggestions.push(`🧘 今日工作任务较多，别忘了安排一些个人时间或休息，保持工作生活平衡`)
  }

  // 检查是否有运动
  const hasExercise = tasks.some(t => {
    const text = `${t.title} ${t.description || ''}`
    return text.includes('运动') || text.includes('健身') || text.includes('锻炼')
  })

  if (!hasExercise && tasks.length > 3) {
    suggestions.push(`🏃 建议安排20-30分钟运动时间，适度运动能提升工作效率和专注力`)
  }

  // 检查深度工作时间
  const deepWorkTasks = tasks.filter(t => 
    t.duration && t.duration >= 90 && 
    (t.category === '工作' || t.category === '学习')
  )

  if (deepWorkTasks.length === 0 && workTasks > 0) {
    suggestions.push(`🎯 建议安排至少一个90分钟的深度工作时段，用于处理复杂任务或创造性工作`)
  }

  return suggestions
}
