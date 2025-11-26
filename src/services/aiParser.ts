import { Task } from '../types'
import { add, set, addDays, addWeeks } from 'date-fns'

interface ParsedTask {
  title: string
  description?: string
  startTime?: Date
  duration?: number
  priority: 'high' | 'medium' | 'low'
  category?: string
  tags?: string[]
}

// Priority keywords
const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'asap', 'critical', 'important', 'priority', 'deadline',
  'must', 'need to', 'have to', 'crucial', 'vital', 'emergency'
]

const LOW_PRIORITY_KEYWORDS = [
  'maybe', 'if possible', 'when free', 'sometime', 'eventually',
  'nice to have', 'optional', 'consider', 'think about'
]

// Time keywords
const TIME_PATTERNS = {
  morning: { start: 9, end: 12 },
  afternoon: { start: 13, end: 17 },
  evening: { start: 18, end: 21 },
  night: { start: 21, end: 23 },
}

// Duration keywords (in minutes)
const DURATION_KEYWORDS: Record<string, number> = {
  'quick': 15,
  'short': 30,
  'brief': 30,
  'hour': 60,
  'hours': 60,
  'long': 120,
  'half day': 240,
  'full day': 480,
}

// Category keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Work': ['meeting', 'call', 'email', 'report', 'presentation', 'project', 'deadline', 'client'],
  'Personal': ['gym', 'exercise', 'workout', 'doctor', 'appointment', 'shopping', 'errands'],
  'Learning': ['read', 'study', 'course', 'learn', 'practice', 'tutorial', 'research'],
  'Social': ['lunch', 'dinner', 'coffee', 'catch up', 'hangout', 'party', 'event'],
  'Health': ['meditation', 'yoga', 'sleep', 'rest', 'break', 'walk', 'run'],
}

/**
 * Parse natural language transcript into structured tasks
 */
export function parseTranscript(transcript: string): Task[] {
  const sentences = splitIntoSentences(transcript)
  const tasks: Task[] = []

  sentences.forEach((sentence, index) => {
    const parsedTask = parseSentence(sentence)
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
 * Split transcript into sentences
 */
function splitIntoSentences(text: string): string[] {
  // Split by common sentence delimiters
  const sentences = text
    .split(/[.!?;]|\band\b|\bthen\b/i)
    .map(s => s.trim())
    .filter(s => s.length > 5) // Filter out very short fragments

  return sentences
}

/**
 * Parse a single sentence into a task
 */
function parseSentence(sentence: string): ParsedTask | null {
  const lowerSentence = sentence.toLowerCase()

  // Check if this looks like a task (contains action verbs)
  const actionVerbs = ['do', 'make', 'write', 'call', 'email', 'meet', 'review', 'finish', 'complete', 'prepare', 'send', 'schedule', 'plan', 'work on', 'attend', 'join']
  const hasActionVerb = actionVerbs.some(verb => lowerSentence.includes(verb))

  if (!hasActionVerb && !lowerSentence.includes('need') && !lowerSentence.includes('have to')) {
    return null
  }

  // Extract task title (clean up the sentence)
  const title = cleanTaskTitle(sentence)

  // Extract time
  const startTime = extractTime(lowerSentence)

  // Extract duration
  const duration = extractDuration(lowerSentence)

  // Determine priority
  const priority = determinePriority(lowerSentence)

  // Determine category
  const category = determineCategory(lowerSentence)

  // Extract tags
  const tags = extractTags(lowerSentence)

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
 * Clean and format task title
 */
function cleanTaskTitle(sentence: string): string {
  let title = sentence
    .replace(/^(i need to|i have to|i want to|i should|i will|i'll|let's|we should|we need to)\s+/i, '')
    .replace(/\s+(at|by|before|after|around|in the|during)\s+\d+/gi, '')
    .replace(/\s+(morning|afternoon|evening|night|today|tomorrow)/gi, '')
    .trim()

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1)

  return title
}

/**
 * Extract time from sentence
 */
function extractTime(sentence: string): Date | undefined {
  const now = new Date()

  // Check for specific time patterns (e.g., "at 9am", "at 2:30pm")
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i
  const timeMatch = sentence.match(timeRegex)

  if (timeMatch) {
    let hours = parseInt(timeMatch[1])
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
    const meridiem = timeMatch[3]?.toLowerCase()

    if (meridiem === 'pm' && hours < 12) hours += 12
    if (meridiem === 'am' && hours === 12) hours = 0

    let date = set(now, { hours, minutes, seconds: 0, milliseconds: 0 })

    // Check for day references
    if (sentence.includes('tomorrow')) {
      date = addDays(date, 1)
    } else if (sentence.includes('next week')) {
      date = addWeeks(date, 1)
    }

    return date
  }

  // Check for time of day patterns
  for (const [period, times] of Object.entries(TIME_PATTERNS)) {
    if (sentence.includes(period)) {
      let date = set(now, { hours: times.start, minutes: 0, seconds: 0, milliseconds: 0 })

      if (sentence.includes('tomorrow')) {
        date = addDays(date, 1)
      }

      return date
    }
  }

  // Default: if "today" or no time specified, return undefined (user can set manually)
  return undefined
}

/**
 * Extract duration from sentence
 */
function extractDuration(sentence: string): number | undefined {
  // Check for explicit duration (e.g., "30 minutes", "2 hours")
  const durationRegex = /(\d+)\s*(minute|minutes|min|hour|hours|hr|hrs)/i
  const durationMatch = sentence.match(durationRegex)

  if (durationMatch) {
    const value = parseInt(durationMatch[1])
    const unit = durationMatch[2].toLowerCase()

    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      return value * 60
    }
    return value
  }

  // Check for duration keywords
  for (const [keyword, minutes] of Object.entries(DURATION_KEYWORDS)) {
    if (sentence.includes(keyword)) {
      return minutes
    }
  }

  // Default duration based on task type
  if (sentence.includes('meeting') || sentence.includes('call')) {
    return 30
  }

  return 60 // Default 1 hour
}

/**
 * Determine task priority
 */
function determinePriority(sentence: string): 'high' | 'medium' | 'low' {
  // Check for high priority keywords
  if (HIGH_PRIORITY_KEYWORDS.some(keyword => sentence.includes(keyword))) {
    return 'high'
  }

  // Check for low priority keywords
  if (LOW_PRIORITY_KEYWORDS.some(keyword => sentence.includes(keyword))) {
    return 'low'
  }

  // Default to medium
  return 'medium'
}

/**
 * Determine task category
 */
function determineCategory(sentence: string): string | undefined {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => sentence.includes(keyword))) {
      return category
    }
  }

  return undefined
}

/**
 * Extract tags from sentence
 */
function extractTags(sentence: string): string[] {
  const tags: string[] = []

  // Extract hashtags
  const hashtagRegex = /#(\w+)/g
  const hashtags = sentence.match(hashtagRegex)
  if (hashtags) {
    tags.push(...hashtags.map(tag => tag.substring(1)))
  }

  return tags
}

/**
 * Generate AI suggestions for task optimization
 */
export function generateTaskSuggestions(tasks: Task[]): string[] {
  const suggestions: string[] = []

  // Check for time conflicts
  const sortedTasks = tasks
    .filter(t => t.startTime)
    .sort((a, b) => (a.startTime!.getTime() - b.startTime!.getTime()))

  for (let i = 0; i < sortedTasks.length - 1; i++) {
    const current = sortedTasks[i]
    const next = sortedTasks[i + 1]

    if (current.endTime && next.startTime && current.endTime > next.startTime) {
      suggestions.push(`⚠️ Time conflict detected between "${current.title}" and "${next.title}"`)
    }
  }

  // Check for too many high priority tasks
  const highPriorityCount = tasks.filter(t => t.priority === 'high').length
  if (highPriorityCount > 3) {
    suggestions.push(`💡 You have ${highPriorityCount} high-priority tasks. Consider focusing on the top 3 most critical ones.`)
  }

  // Check for missing time estimates
  const noTimeCount = tasks.filter(t => !t.startTime).length
  if (noTimeCount > 0) {
    suggestions.push(`📅 ${noTimeCount} task(s) don't have a scheduled time. Consider adding time blocks for better planning.`)
  }

  // Check for work-life balance
  const workTasks = tasks.filter(t => t.category === 'Work').length
  const personalTasks = tasks.filter(t => t.category === 'Personal' || t.category === 'Health').length

  if (workTasks > 0 && personalTasks === 0) {
    suggestions.push(`🧘 Don't forget to schedule some personal time or breaks for better work-life balance.`)
  }

  return suggestions
}
