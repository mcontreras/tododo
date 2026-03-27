import { Task } from '../types'

export type NotificationTiming = '60min' | '30min' | '15min' | '5min' | 'due' | 'overdue'

const TIMING_WINDOWS: Record<NotificationTiming, { minBefore: number; windowMs: number }> = {
  '60min': { minBefore: 60, windowMs: 2 * 60 * 1000 },
  '30min': { minBefore: 30, windowMs: 2 * 60 * 1000 },
  '15min': { minBefore: 15, windowMs: 2 * 60 * 1000 },
  '5min':  { minBefore: 5,  windowMs: 2 * 60 * 1000 },
  'due':   { minBefore: 0,  windowMs: 2 * 60 * 1000 },
  'overdue': { minBefore: -1, windowMs: 2 * 60 * 1000 },
}

export const notificationService = {
  isSupported(): boolean {
    return 'Notification' in window
  },

  hasPermission(): boolean {
    return this.isSupported() && Notification.permission === 'granted'
  },

  isDenied(): boolean {
    return this.isSupported() && Notification.permission === 'denied'
  },

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false
    if (this.hasPermission()) return true
    const result = await Notification.requestPermission()
    return result === 'granted'
  },

  send(title: string, body: string, tag?: string): Notification | null {
    if (!this.hasPermission()) return null
    const n = new Notification(title, {
      body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag,
      requireInteraction: false,
    })
    n.onclick = () => { window.focus(); n.close() }
    return n
  },

  /** Returns which timing slot fires now for a given due date, or null */
  getTimingForTask(task: Task): NotificationTiming | null {
    if (!task.dueDate || task.completed) return null
    const now = Date.now()
    const due = new Date(task.dueDate).getTime()
    const diffMs = due - now   // positive = in the future

    // Overdue: past due by 0–2 min (first poll after deadline)
    if (diffMs < 0 && diffMs >= -TIMING_WINDOWS.overdue.windowMs) return 'overdue'

    for (const [key, { minBefore, windowMs }] of Object.entries(TIMING_WINDOWS)) {
      if (key === 'overdue') continue
      const target = minBefore * 60 * 1000
      if (diffMs >= target && diffMs < target + windowMs) return key as NotificationTiming
    }
    return null
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildMessage(task: Task, timing: NotificationTiming, t: (k: any) => string): { title: string; body: string } {
    const title = task.title
    const labels: Record<NotificationTiming, string> = {
      '60min':  t('notif_60min'),
      '30min':  t('notif_30min'),
      '15min':  t('notif_15min'),
      '5min':   t('notif_5min'),
      'due':    t('notif_due'),
      'overdue': t('notif_overdue'),
    }
    return { title, body: labels[timing] }
  },
}
