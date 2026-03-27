import { Calendar, Flag, Paperclip, Link2, Check } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../../api/tasks'
import { useUIStore } from '../../store/uiStore'
import { useI18n } from '../../store/i18nStore'
import { Task } from '../../types'
import { cn } from '../ui/cn'

const PRIORITY_COLORS: Record<string, string> = {
  NONE: 'text-gray-300',
  LOW: 'text-blue-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-red-400',
}

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { selectedTaskId, setSelectedTask } = useUIStore()
  const { t } = useI18n()
  const qc = useQueryClient()
  const isSelected = selectedTaskId === task.id

  const toggle = useMutation({
    mutationFn: () => tasksApi.update(task.id, { completed: !task.completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))

  return (
    <div
      className={cn('task-item group', task.completed && 'opacity-60', isSelected && 'border-blue-200 bg-blue-50/50 shadow-sm')}
      onClick={() => setSelectedTask(isSelected ? null : task.id)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); toggle.mutate() }}
        className={cn(
          'mt-0.5 w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
          task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
        )}
      >
        {task.completed && <Check size={10} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium text-gray-800 truncate', task.completed && 'line-through text-gray-400')}>
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.dueDate && (
            <span className={cn('flex items-center gap-1 text-xs',
              isOverdue ? 'text-red-500 font-medium' : isDueToday ? 'text-orange-500 font-medium' : 'text-gray-400')}>
              <Calendar size={11} />
              {isDueToday ? t('today') : format(new Date(task.dueDate), 'MMM d')}
              {task.dueDate.includes('T') && `, ${format(new Date(task.dueDate), 'HH:mm')}`}
            </span>
          )}

          {/* Column badge */}
          {task.column && (
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${task.column.color}20`, color: task.column.color }}>
              {task.column.name}
            </span>
          )}

          {task.categories.slice(0, 2).map((tc) => (
            <span key={tc.categoryId} className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${tc.category.color}20`, color: tc.category.color }}>
              {tc.category.name}
            </span>
          ))}
          {task.categories.length > 2 && <span className="text-xs text-gray-400">+{task.categories.length - 2}</span>}

          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <Paperclip size={11} /> {task.attachments.length}
            </span>
          )}
          {task.url && <Link2 size={11} className="text-gray-300" />}

          {task.list && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.list.color }} />
              {task.list.name}
            </span>
          )}
        </div>
      </div>

      {task.priority !== 'NONE' && (
        <Flag size={13} className={cn('shrink-0', PRIORITY_COLORS[task.priority])} fill="currentColor" />
      )}
    </div>
  )
}
