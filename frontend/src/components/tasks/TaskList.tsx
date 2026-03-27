import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { tasksApi } from '../../api/tasks'
import { useUIStore } from '../../store/uiStore'
import { useI18n } from '../../store/i18nStore'
import { TaskItem } from './TaskItem'
import { TaskForm } from './TaskForm'
import { Task } from '../../types'

export function TaskList() {
  const [showForm, setShowForm] = useState(false)
  const { selectedListId, showCompleted } = useUIStore()
  const { t } = useI18n()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { listId: selectedListId }],
    queryFn: () => tasksApi.getAll(selectedListId ? { listId: selectedListId } : undefined),
  })

  const pending = tasks.filter((t: Task) => !t.completed)
  const completed = tasks.filter((t: Task) => t.completed)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 w-full px-4 py-2.5 mb-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
      >
        <Plus size={16} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">{t('add_task')}</span>
      </button>

      {pending.length === 0 && completed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-700">{t('all_clear')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('all_clear_subtitle')}</p>
        </div>
      )}

      <div className="space-y-2">
        {pending.map((task: Task) => <TaskItem key={task.id} task={task} />)}
      </div>

      {showCompleted && completed.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {t('completed_label')} · {completed.length}
          </p>
          <div className="space-y-2">
            {completed.map((task: Task) => <TaskItem key={task.id} task={task} />)}
          </div>
        </div>
      )}

      <TaskForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
