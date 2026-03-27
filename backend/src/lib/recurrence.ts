export interface RecurrenceConfig {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number       // every N days / weeks / months
  weekDays?: number[]    // ISO: 1=Mon … 7=Sun  (only used for weekly)
}

/**
 * Given the current due date and a recurrence config, returns the next
 * due date. For weekly with weekDays, it finds the next matching weekday
 * after the current one (within the same cycle or the next one).
 */
export function nextOccurrence(dueDate: Date, config: RecurrenceConfig): Date {
  const d = new Date(dueDate)

  if (config.type === 'daily') {
    d.setDate(d.getDate() + config.interval)
    return d
  }

  if (config.type === 'monthly') {
    d.setMonth(d.getMonth() + config.interval)
    return d
  }

  // weekly
  if (config.weekDays && config.weekDays.length > 0) {
    // Convert JS getDay() (0=Sun) to ISO (1=Mon…7=Sun)
    const toISO = (jsDay: number) => jsDay === 0 ? 7 : jsDay
    const currentISO = toISO(d.getDay())
    const sorted = [...config.weekDays].sort((a, b) => a - b)

    // Is there a later day in the SAME week?
    const nextInWeek = sorted.find(day => day > currentISO)
    if (nextInWeek !== undefined) {
      d.setDate(d.getDate() + (nextInWeek - currentISO))
    } else {
      // Jump to the first selected day of the next cycle
      const firstDay = sorted[0]
      const daysToEndOfWeek = 7 - currentISO            // days until end of week
      const daysIntoNextCycle = firstDay                 // days from Monday
      d.setDate(d.getDate() + daysToEndOfWeek + daysIntoNextCycle + (config.interval - 1) * 7)
    }
    return d
  }

  // weekly without day filter → same weekday, N weeks later
  d.setDate(d.getDate() + 7 * config.interval)
  return d
}
