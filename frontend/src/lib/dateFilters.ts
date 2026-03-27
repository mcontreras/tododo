import { isToday, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import { Task } from '../types'
import { SmartFilter } from '../store/uiStore'

export function applySmartFilter(tasks: Task[], filter: SmartFilter): Task[] {
  const now = new Date()

  if (filter === 'today') {
    return tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)))
  }

  if (filter === 'week') {
    // From start of today to end of Sunday (ISO week start = Mon)
    const from = startOfDay(now)
    const to = endOfWeek(now, { weekStartsOn: 1 })
    return tasks.filter((t) => {
      if (!t.dueDate) return false
      const d = new Date(t.dueDate)
      return d >= from && d <= to
    })
  }

  return tasks
}
