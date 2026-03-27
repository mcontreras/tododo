import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tasksApi } from '../api/tasks'
import { notificationService, NotificationTiming } from '../services/notificationService'
import { useI18n } from '../store/i18nStore'
import { Task } from '../types'

// ─── Persisted store for notification preferences ────────────────────────────
interface NotifState {
  enabled: boolean
  setEnabled: (v: boolean) => void
  toggle: () => void
}

export const useNotifStore = create<NotifState>()(
  persist(
    (set, get) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
      toggle: () => set({ enabled: !get().enabled }),
    }),
    { name: 'tododo-notifications', partialize: (s) => ({ enabled: s.enabled }) }
  )
)

// ─── Hook ─────────────────────────────────────────────────────────────────────
const POLL_INTERVAL = 60_000 // 1 minute

export function useTaskNotifications() {
  const { enabled } = useNotifStore()
  const { t } = useI18n()
  // key: `${taskId}:${timing}` → true when notification already sent today
  const sentRef = useRef<Set<string>>(new Set())

  // Reset sent set at midnight
  useEffect(() => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msToMidnight = midnight.getTime() - now.getTime()
    const timer = setTimeout(() => sentRef.current.clear(), msToMidnight)
    return () => clearTimeout(timer)
  }, [])

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll(),
    refetchInterval: enabled ? POLL_INTERVAL : false,
    enabled,
  })

  useEffect(() => {
    if (!enabled || !tasks) return

    const pending = tasks.filter((t: Task) => !t.completed && t.dueDate)
    for (const task of pending) {
      const timing = notificationService.getTimingForTask(task)
      if (!timing) continue

      const key = `${task.id}:${timing}`
      if (sentRef.current.has(key)) continue

      sentRef.current.add(key)
      const { title, body } = notificationService.buildMessage(task, timing, t)
      notificationService.send(title, body, key)
    }
  }, [tasks, enabled, t])
}

// ─── Helper: request permission and enable ───────────────────────────────────
export async function enableNotifications(): Promise<boolean> {
  const granted = await notificationService.requestPermission()
  if (granted) useNotifStore.getState().setEnabled(true)
  return granted
}
