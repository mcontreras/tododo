import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { columnsApi } from '../../api/columns'
import { useI18n } from '../../store/i18nStore'
import { KanbanCard } from './KanbanCard'
import { Task, KanbanColumn as KanbanColumnType } from '../../types'
import { cn } from '../ui/cn'

interface KanbanColumnProps {
  column: KanbanColumnType
  tasks: Task[]
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const [editing, setEditing] = useState(false)
  const [nameValue, setNameValue] = useState(column.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()
  const { t } = useI18n()

  const updateCol = useMutation({
    mutationFn: (name: string) => columnsApi.update(column.id, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['columns'] }); setEditing(false) },
  })

  const deleteCol = useMutation({
    mutationFn: () => columnsApi.delete(column.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['columns'] }),
  })

  function startEdit() {
    setNameValue(column.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 50)
  }

  function commitEdit() {
    if (nameValue.trim() && nameValue.trim() !== column.name) {
      updateCol.mutate(nameValue.trim())
    } else {
      setEditing(false)
    }
  }

  return (
    <div className="kanban-column flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 mb-3 group">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: column.color }} />

        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              ref={inputRef}
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="flex-1 text-sm font-semibold bg-white border border-blue-300 rounded-md px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button onClick={commitEdit} className="p-0.5 text-green-500 hover:text-green-600">
              <Check size={13} />
            </button>
            <button onClick={() => setEditing(false)} className="p-0.5 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          </div>
        ) : (
          <>
            <span
              className="text-sm font-semibold text-gray-700 flex-1 cursor-pointer hover:text-blue-600 transition-colors"
              onDoubleClick={startEdit}
              title={t('edit_column')}
            >
              {column.name}
            </span>
            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
              {tasks.length}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={startEdit}
                className="p-1 text-gray-300 hover:text-blue-500 rounded transition-colors"
                title={t('edit_column')}
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => deleteCol.mutate()}
                className="p-1 text-gray-300 hover:text-red-400 rounded transition-colors"
                title={t('delete_column')}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 min-h-[120px] rounded-xl p-2 transition-colors',
          isOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-100/50'
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => <KanbanCard key={task.id} task={task} />)}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-6 text-xs text-gray-300">
            {t('drop_here')}
          </div>
        )}
      </div>
    </div>
  )
}
