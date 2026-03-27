import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Flag, Paperclip } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../../api/tasks'
import { useUIStore } from '../../store/uiStore'
import { Task } from '../../types'
import { cn } from '../ui/cn'

const PRIORITY_COLORS: Record<string, string> = {
  NONE: 'text-gray-200',
  LOW: 'text-blue-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-red-400',
}

interface KanbanCardProps {
  task: Task
  isDragging?: boolean
}

export function KanbanCard({ task, isDragging }: KanbanCardProps) {
  const { selectedTaskId, setSelectedTask } = useUIStore()
  const qc = useQueryClient()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id })

  const toggle = useMutation({
    mutationFn: () => tasksApi.update(task.id, { completed: !task.completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isSortableDragging ? 0.4 : 1 }
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed
  const isSelected = selectedTaskId === task.id

  return (
    <div
      ref={setNodeRef}
      style={isDragging ? undefined : style}
      {...attributes}
      {...listeners}
      className={cn('kanban-card touch-none', isSelected && 'ring-2 ring-blue-400', isDragging && 'rotate-2 shadow-2xl')}
      onClick={() => setSelectedTask(isSelected ? null : task.id)}
    >
      {task.priority !== 'NONE' && (
        <div className="flex justify-end mb-1">
          <Flag size={12} className={PRIORITY_COLORS[task.priority]} fill="currentColor" />
        </div>
      )}

      <p className={cn('text-sm font-medium text-gray-800 leading-snug mb-2', task.completed && 'line-through text-gray-400')}>
        {task.title}
      </p>

      {task.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.categories.slice(0, 3).map((tc) => (
            <span key={tc.categoryId} className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${tc.category.color}20`, color: tc.category.color }}>
              {tc.category.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-1">
        {task.dueDate && (
          <span className={cn('flex items-center gap-1 text-xs',
            isOverdue ? 'text-red-500 font-medium' : isToday(new Date(task.dueDate)) ? 'text-orange-500' : 'text-gray-400')}>
            <Calendar size={10} />
            {isToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
        {task.attachments.length > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-gray-400 ml-auto">
            <Paperclip size={10} /> {task.attachments.length}
          </span>
        )}
      </div>
    </div>
  )
}
