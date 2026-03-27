import { useState } from 'react'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { tasksApi } from '../../api/tasks'
import { columnsApi } from '../../api/columns'
import { useUIStore } from '../../store/uiStore'
import { useI18n } from '../../store/i18nStore'
import { applySmartFilter } from '../../lib/dateFilters'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { Task, KanbanColumn as KanbanColumnType } from '../../types'
import { ColorPicker } from '../ui/ColorPicker'
import { cn } from '../ui/cn'

export function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showAddCol, setShowAddCol] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColColor, setNewColColor] = useState('#6B7280')
  const { selectedListId, smartFilter, showCompleted } = useUIStore()
  const { t } = useI18n()
  const qc = useQueryClient()

  const { data: columns = [] } = useQuery({ queryKey: ['columns'], queryFn: columnsApi.getAll })
  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks', { listId: selectedListId }],
    queryFn: () => tasksApi.getAll(selectedListId ? { listId: selectedListId } : undefined),
  })

  const moveTask = useMutation({
    mutationFn: ({ id, columnId }: { id: string; columnId: string }) =>
      tasksApi.update(id, { columnId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })


  const createColumn = useMutation({
    mutationFn: () => columnsApi.create({ name: newColName.trim(), color: newColColor }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['columns'] })
      setNewColName('')
      setShowAddCol(false)
    },
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const filtered = smartFilter ? applySmartFilter(allTasks, smartFilter) : allTasks
  const tasks = showCompleted ? filtered : filtered.filter((t: Task) => !t.completed)

  function getTasksByColumn(columnId: string): Task[] {
    return tasks.filter((t: Task) => t.columnId === columnId)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(tasks.find((t: Task) => t.id === event.active.id) || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return
    const taskId = active.id as string
    const overId = over.id as string
    const col = columns.find((c: KanbanColumnType) => c.id === overId)
    if (col) {
      const task = tasks.find((t: Task) => t.id === taskId)
      if (task && task.columnId !== col.id) moveTask.mutate({ id: taskId, columnId: col.id })
    }
  }

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <div className="flex gap-4 h-full min-h-0 pb-4 items-start">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {columns.map((col: KanbanColumnType) => (
            <KanbanColumn key={col.id} column={col} tasks={getTasksByColumn(col.id)} />
          ))}
          <DragOverlay>{activeTask && <KanbanCard task={activeTask} isDragging />}</DragOverlay>
        </DndContext>

        {/* Add column */}
        <div className="kanban-column shrink-0">
          {showAddCol ? (
            <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 animate-scale-in">
              <input
                autoFocus
                className="input text-sm"
                placeholder={t('column_name_placeholder')}
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newColName.trim()) createColumn.mutate()
                  if (e.key === 'Escape') setShowAddCol(false)
                }}
              />
              <ColorPicker value={newColColor} onChange={setNewColColor} />
              <div className="flex gap-2">
                <button
                  onClick={() => { if (newColName.trim()) createColumn.mutate() }}
                  disabled={!newColName.trim() || createColumn.isPending}
                  className="btn-primary btn text-xs flex-1"
                >
                  {t('create')}
                </button>
                <button onClick={() => setShowAddCol(false)} className="btn-secondary btn text-xs flex-1">
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCol(true)}
              className={cn(
                'flex items-center justify-center gap-2 w-full py-3 rounded-xl',
                'border-2 border-dashed border-gray-200 text-gray-400',
                'hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50',
                'transition-all text-sm font-medium'
              )}
            >
              <Plus size={16} /> {t('add_column')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
