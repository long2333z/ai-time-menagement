import { Task, Insight } from '../types'
import { differenceInMinutes } from 'date-fns'

/**
 * AI洞察生成引擎 - 基于GTD、双峰工作法、番茄钟等时间管理理念
 */

interface UserContext {
  tasks: Task[]
  occupation?: string
  workMode?: 'office' | 'remote' | 'hybrid'
}

interface TimeBlock {
  start: Date
  end: Date
  duration: number
  type: 'free' | 'commute' | 'break' | 'deep-work' | 'shallow-work'
  description: string
}

/**
 * 分析用户身份和工作场景
 */
export function analyzeUserProfile(context: UserContext): {
  identity: string
  goals: string[]
  challenges: string[]
  workStyle: string
} {
  const { tasks, occupation } = context
  
  // 分析任务类型分布
  // const taskCategories = tasks.reduce((acc, task) => {
  //   const cat = task.category || '其他'
  //   acc[cat] = (acc[cat] || 0) + 1
  //   return acc
  // }, {} as Record<string, number>)

  // 分析任务关键词
  const allText = tasks.map(t => `${t.title} ${t.description || ''}`).join(' ').toLowerCase()
  
  let identity = occupation || '知识工作者'
  const goals: string[] = []
  const challenges: string[] = []
  let workStyle = '平衡型'

  // 深度内容创作者特征
  if (allText.includes('写作') || allText.includes('创作') || allText.includes('文章') || 
      allText.includes('内容') || allText.includes('设计')) {
    identity = '深度内容创作者'
    goals.push('保持创作灵感', '提升内容质量', '高效完成创作任务')
    challenges.push('灵感捕捉困难', '长时间专注写作', '创意枯竭')
    workStyle = '深度工作型'
  }
  
  // 学习提升者特征
  else if (allText.includes('学习') || allText.includes('课程') || allText.includes('阅读') ||
           allText.includes('研究') || allText.includes('练习')) {
    identity = '自我提升学习者'
    goals.push('系统化学习', '知识内化', '技能提升')
    challenges.push('学习时间碎片化', '知识吸收效率低', '缺乏持续动力')
    workStyle = '成长型'
  }
  
  // 项目管理者特征
  else if (allText.includes('会议') || allText.includes('协调') || allText.includes('管理') ||
           allText.includes('汇报') || allText.includes('评审')) {
    identity = '项目协调管理者'
    goals.push('高效协调团队', '推进项目进度', '平衡多任务')
    challenges.push('会议过多', '深度工作时间不足', '精力分散')
    workStyle = '协调型'
  }

  // 技术开发者特征
  else if (allText.includes('开发') || allText.includes('编码') || allText.includes('调试') ||
           allText.includes('代码') || allText.includes('技术')) {
    identity = '技术开发工程师'
    goals.push('深度专注编码', '解决技术难题', '提升代码质量')
    challenges.push('频繁被打断', '需要长时间专注', '技术攻坚压力')
    workStyle = '深度工作型'
  }

  return { identity, goals, challenges, workStyle }
}

/**
 * 识别暗时间 - 可被利用的时间块
 */
export function identifyDarkTime(tasks: Task[]): TimeBlock[] {
  const darkTimeBlocks: TimeBlock[] = []
  
  // 排序任务
  const sortedTasks = tasks
    .filter(t => t.startTime && t.endTime)
    .sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime())

  if (sortedTasks.length === 0) return darkTimeBlocks

  const dayStart = new Date(sortedTasks[0].startTime!)
  dayStart.setHours(6, 0, 0, 0)
  
  const dayEnd = new Date(sortedTasks[0].startTime!)
  dayEnd.setHours(23, 0, 0, 0)

  // 找出任务间的空隙
  let currentTime = dayStart

  sortedTasks.forEach((task) => {
    const taskStart = task.startTime!
    const taskEnd = task.endTime!

    // 检查当前时间到任务开始之间的空隙
    if (currentTime < taskStart) {
      const gapDuration = differenceInMinutes(taskStart, currentTime)
      
      if (gapDuration >= 15) {
        const block = analyzeTimeBlock(currentTime, taskStart)
        if (block) darkTimeBlocks.push(block)
      }
    }

    currentTime = taskEnd > currentTime ? taskEnd : currentTime
  })

  // 检查最后一个任务到一天结束的时间
  if (currentTime < dayEnd) {
    const gapDuration = differenceInMinutes(dayEnd, currentTime)
    if (gapDuration >= 30) {
      darkTimeBlocks.push({
        start: currentTime,
        end: dayEnd,
        duration: gapDuration,
        type: 'free',
        description: '晚间自由时间'
      })
    }
  }

  return darkTimeBlocks
}

/**
 * 分析时间块类型和特征
 */
function analyzeTimeBlock(start: Date, end: Date): TimeBlock | null {
  const duration = differenceInMinutes(end, start)
  const hour = start.getHours()

  // 通勤时间识别
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    if (duration >= 20 && duration <= 120) {
      return {
        start,
        end,
        duration,
        type: 'commute',
        description: hour < 12 ? '早晨通勤时间' : '晚间通勤时间'
      }
    }
  }

  // 午休时间
  if (hour >= 12 && hour <= 14 && duration >= 30) {
    return {
      start,
      end,
      duration,
      type: 'break',
      description: '午休时间'
    }
  }

  // 深度工作时间块
  if (duration >= 90 && (hour >= 9 && hour <= 11 || hour >= 14 && hour <= 16)) {
    return {
      start,
      end,
      duration,
      type: 'deep-work',
      description: '深度工作黄金时段'
    }
  }

  // 碎片时间
  if (duration >= 15 && duration < 45) {
    return {
      start,
      end,
      duration,
      type: 'shallow-work',
      description: '碎片时间'
    }
  }

  // 自由时间
  if (duration >= 45) {
    return {
      start,
      end,
      duration,
      type: 'free',
      description: '自由时间块'
    }
  }

  return null
}

/**
 * 生成暗时间利用建议
 */
export function generateDarkTimeInsights(darkTimeBlocks: TimeBlock[], userProfile: { identity: string, workStyle: string }): Insight[] {
  const insights: Insight[] = []
  const { identity, workStyle } = userProfile

  darkTimeBlocks.forEach((block, index) => {
    let suggestion = ''
    let actionText = ''

    switch (block.type) {
      case 'commute':
        if (block.duration >= 30) {
          if (identity.includes('学习者')) {
            suggestion = `💡 发现${block.duration}分钟通勤时间！建议使用骨传导耳机收听专业课程或有声书，既保证安全又能高效学习。推荐工具：Aftershokz骨传导耳机 + 得到/喜马拉雅APP`
            actionText = '设置通勤学习计划'
          } else if (identity.includes('创作者')) {
            suggestion = `✨ ${block.duration}分钟通勤是灵感捕捉的黄金时段！建议使用语音备忘录随时记录创意闪现，或用思维导图APP整理创作思路。推荐工具：讯飞语记 + XMind`
            actionText = '启用灵感捕捉系统'
          } else {
            suggestion = `🎧 ${block.duration}分钟通勤时间可以用来：1) 听播客学习行业知识 2) 复盘昨日工作 3) 规划今日重点。推荐：小宇宙APP + Notion快速记录`
            actionText = '优化通勤时间利用'
          }
        }
        break

      case 'break':
        if (block.duration >= 20 && block.duration <= 30) {
          suggestion = `😴 ${block.duration}分钟午休时间建议使用NSDR（非睡眠深度休息）方法：通过引导式冥想快速恢复精力，效果媲美1小时睡眠！推荐：Huberman Lab的NSDR音频 + 安静环境`
          actionText = '尝试NSDR休息法'
        } else if (block.duration > 30) {
          suggestion = `🧘 ${block.duration}分钟休息时间充足！建议：前20分钟NSDR恢复精力，后续时间散步或轻度运动，激活下午的工作状态。`
          actionText = '制定午休恢复计划'
        }
        break

      case 'deep-work':
        if (workStyle === '深度工作型') {
          suggestion = `🎯 发现${block.duration}分钟深度工作黄金时段！这是你的认知巅峰期，建议：1) 关闭所有通知 2) 使用番茄钟法（25分钟专注+5分钟休息）3) 处理最重要的创造性任务。推荐工具：Forest专注APP + 降噪耳机`
          actionText = '锁定深度工作时段'
        } else {
          suggestion = `⚡ ${block.duration}分钟完整时间块！建议安排需要深度思考的任务，如战略规划、复杂问题解决、学习新技能等。采用双峰工作法，将高认知任务集中在此时段。`
          actionText = '安排高价值任务'
        }
        break

      case 'shallow-work':
        suggestion = `📋 ${block.duration}分钟碎片时间适合处理：1) 回复邮件/消息 2) 整理文档 3) 快速沟通 4) 日程规划。避免在此时段开始需要深度专注的任务。`
        actionText = '规划碎片任务清单'
        break

      case 'free':
        if (block.duration >= 120) {
          if (identity.includes('创作者')) {
            suggestion = `🖥️ ${block.duration}分钟大块自由时间！强烈建议为创作配置双屏或超宽屏显示器，一屏用于写作，一屏用于资料参考和灵感收集，效率可提升40%以上！`
            actionText = '优化创作环境'
          } else if (identity.includes('开发')) {
            suggestion = `💻 ${block.duration}分钟连续时间！这是攻克技术难题的最佳时机。建议：1) 准备好开发环境 2) 关闭干扰源 3) 使用Pomodoro Technique保持专注节奏`
            actionText = '安排技术攻坚任务'
          } else {
            suggestion = `🌟 ${block.duration}分钟完整时间块！建议用于：1) 战略思考和规划 2) 学习新技能 3) 个人项目推进。这是实现自我提升的黄金时段！`
            actionText = '规划个人成长任务'
          }
        }
        break
    }

    if (suggestion) {
      insights.push({
        id: `dark-time-${index}-${Date.now()}`,
        type: 'time-management',
        title: `暗时间挖掘：${block.description}`,
        description: suggestion,
        priority: block.duration >= 60 ? 'high' : 'medium',
        actionable: true,
        actionText,
        createdAt: new Date(),
        isRead: false,
        isFavorite: false,
      })
    }
  })

  return insights
}

/**
 * 分析任务并行可能性
 */
export function analyzeTaskParallelization(tasks: Task[]): Insight[] {
  const insights: Insight[] = []
  
  // 识别可以并行的任务组合
  const parallelOpportunities: Array<{
    task1: Task
    task2: Task
    reason: string
    method: string
  }> = []

  tasks.forEach((task1, i) => {
    tasks.slice(i + 1).forEach(task2 => {
      // 被动任务 + 主动任务的并行
      const passive = ['通勤', '等待', '排队', '乘车', '飞机', '高铁']
      const active = ['学习', '阅读', '思考', '规划', '整理']
      
      const task1Text = `${task1.title} ${task1.description || ''}`.toLowerCase()
      const task2Text = `${task2.title} ${task2.description || ''}`.toLowerCase()
      
      const isTask1Passive = passive.some(p => task1Text.includes(p))
      const isTask2Active = active.some(a => task2Text.includes(a))
      
      if (isTask1Passive && isTask2Active) {
        parallelOpportunities.push({
          task1,
          task2,
          reason: '被动等待时间可以并行主动学习任务',
          method: '使用移动设备或语音工具在等待时完成学习任务'
        })
      }
    })
  })

  // 生成并行建议
  parallelOpportunities.forEach((opp, index) => {
    insights.push({
      id: `parallel-${index}-${Date.now()}`,
      type: 'productivity',
      title: `任务并行机会：${opp.task1.title} + ${opp.task2.title}`,
      description: `💡 ${opp.reason}。具体方法：${opp.method}。这样可以节省至少${opp.task2.duration || 30}分钟的时间！`,
      priority: 'high',
      actionable: true,
      actionText: '设置并行任务',
      createdAt: new Date(),
      isRead: false,
      isFavorite: false,
    })
  })

  return insights
}

/**
 * 生成工作生活平衡建议
 */
export function generateWorkLifeBalanceInsights(tasks: Task[]): Insight[] {
  const insights: Insight[] = []
  
  const workTasks = tasks.filter(t => t.category === 'Work' || t.category === '工作')
  const personalTasks = tasks.filter(t => t.category === 'Personal' || t.category === '个人' || t.category === 'Health' || t.category === '健康')
  
  const workTime = workTasks.reduce((sum, t) => sum + (t.duration || 0), 0)
  const personalTime = personalTasks.reduce((sum, t) => sum + (t.duration || 0), 0)
  
  // 工作时间过长
  if (workTime > 480 && personalTime < 60) {
    insights.push({
      id: `balance-work-${Date.now()}`,
      type: 'general',
      title: '⚠️ 工作生活失衡预警',
      description: `今日工作时间${(workTime / 60).toFixed(1)}小时，个人时间仅${personalTime}分钟。长期高强度工作会导致效率下降和倦怠。建议：1) 每工作90分钟休息10分钟 2) 安排至少30分钟运动或放松 3) 设置工作结束时间边界`,
      priority: 'high',
      actionable: true,
      actionText: '添加休息和个人时间',
      createdAt: new Date(),
      isRead: false,
      isFavorite: false,
    })
  }
  
  // 缺少运动
  const hasExercise = tasks.some(t => {
    const text = `${t.title} ${t.description || ''}`.toLowerCase()
    return text.includes('运动') || text.includes('健身') || text.includes('跑步') || 
           text.includes('瑜伽') || text.includes('锻炼')
  })
  
  if (!hasExercise && workTime > 240) {
    insights.push({
      id: `balance-exercise-${Date.now()}`,
      type: 'health',
      title: '🏃 建议增加运动时间',
      description: `今日缺少运动安排。研究表明，适度运动可提升认知能力和工作效率20-30%。建议：1) 午休后散步15分钟 2) 工作间隙做办公室拉伸 3) 晚间安排30分钟有氧运动。推荐APP：Keep、Nike Training Club`,
      priority: 'medium',
      actionable: true,
      actionText: '添加运动计划',
      createdAt: new Date(),
      isRead: false,
      isFavorite: false,
    })
  }

  return insights
}

/**
 * 综合生成AI洞察
 */
export function generateComprehensiveInsights(context: UserContext): Insight[] {
  const allInsights: Insight[] = []
  
  // 1. 分析用户画像
  const profile = analyzeUserProfile(context)
  
  // 2. 识别暗时间
  const darkTimeBlocks = identifyDarkTime(context.tasks)
  const darkTimeInsights = generateDarkTimeInsights(darkTimeBlocks, {
    identity: profile.identity,
    workStyle: profile.workStyle
  })
  allInsights.push(...darkTimeInsights)
  
  // 3. 任务并行分析
  const parallelInsights = analyzeTaskParallelization(context.tasks)
  allInsights.push(...parallelInsights)
  
  // 4. 工作生活平衡
  const balanceInsights = generateWorkLifeBalanceInsights(context.tasks)
  allInsights.push(...balanceInsights)
  
  // 5. 添加用户画像洞察
  if (profile.identity !== '知识工作者') {
    allInsights.unshift({
      id: `profile-${Date.now()}`,
      type: 'general',
      title: `🎯 AI识别：你是${profile.identity}`,
      description: `基于你的任务分析，你的核心目标是：${profile.goals.join('、')}。主要挑战：${profile.challenges.join('、')}。我将为你提供针对性的时间管理建议。`,
      priority: 'high',
      actionable: false,
      createdAt: new Date(),
      isRead: false,
      isFavorite: false,
    })
  }
  
  return allInsights
}
