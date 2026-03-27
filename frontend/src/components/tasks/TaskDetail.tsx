import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Calendar, Link2, Paperclip, Trash2, Download, Tag, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { tasksApi } from '../../api/tasks'
import { categoriesApi } from '../../api/categories'
import { columnsApi } from '../../api/columns'
import { useUIStore } from '../../store/uiStore'
import { useI18n } from '../../store/i18nStore'
import { Textarea, Input } from '../ui/Input'
import { Category, Task, KanbanColumn } from '../../types'
import { cn } from '../ui/cn'

const PRIORITY_CONFIG = {
  NONE: { color: '#9CA3AF' },
  LOW: { color: '#3B82F6' },
  MEDIUM: { color: '#F59E0B' },
  HIGH: { color: '#EF4444' },
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function TaskDetail() {
  const { selectedTaskId, setSelectedTask } = useUIStore()
  const { t } = useI18n()
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => { setConfirmDelete(false) }, [selectedTaskId])

  const { data: task } = useQuery({
    queryKey: ['tasks', selectedTaskId],
    queryFn: () => tasksApi.getById(selectedTaskId!),
    enabled: !!selectedTaskId,
  })

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll })
  const { data: columns = [] } = useQuery({ queryKey: ['columns'], queryFn: columnsApi.getAll })

  const update = useMutation({
    mutationFn: (data: Parameters<typeof tasksApi.update>[1]) => tasksApi.update(task!.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteTask = useMutation({
    mutationFn: () => tasksApi.delete(task!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setSelectedTask(null) },
  })

  const uploadFile = useMutation({
    mutationFn: (file: File) => tasksApi.uploadAttachment(task!.id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', task!.id] }),
  })

  const deleteAttachment = useMutation({
    mutationFn: (id: string) => tasksApi.deleteAttachment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', task!.id] }),
  })

  if (!selectedTaskId || !task) return null

  const priorityConf = PRIORITY_CONFIG[task.priority]
  const taskCategoryIds = task.categories.map((tc) => tc.categoryId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile.mutate(file)
    e.target.value = ''
  }

  return (
    <aside className="flex flex-col h-full bg-white border-l border-gray-100 overflow-y-auto animate-slide-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => update.mutate({ completed: !task.completed })}
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
            )}
          >
            {task.completed && <Check size={11} strokeWidth={3} />}
          </button>
          <span className="text-xs text-gray-400">{task.completed ? t('completed_label') : t('mark_complete')}</span>
        </div>
        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1 animate-scale-in">
              <span className="text-xs text-red-600 font-medium whitespace-nowrap">{t('delete_confirm')}</span>
              <button onClick={() => deleteTask.mutate()} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors">
                {t('delete')}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-600 px-1 transition-colors">
                {t('cancel')}
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-5">
        {/* Title */}
        {editingTitle ? (
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={() => { if (titleValue.trim()) update.mutate({ title: titleValue.trim() }); setEditingTitle(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { if (titleValue.trim()) update.mutate({ title: titleValue.trim() }); setEditingTitle(false) }
              if (e.key === 'Escape') setEditingTitle(false)
            }}
            autoFocus className="text-base font-semibold"
          />
        ) : (
          <h2
            className={cn('text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors leading-snug', task.completed && 'line-through text-gray-400')}
            onClick={() => { setEditingTitle(true); setTitleValue(task.title) }}
          >
            {task.title}
          </h2>
        )}

        {/* Column + Priority */}
        <div className="flex flex-wrap gap-2">
          {columns.length > 0 && (
            <select
              className="badge cursor-pointer border-none outline-none appearance-none pr-1 text-xs"
              style={task.column
                ? { backgroundColor: `${task.column.color}20`, color: task.column.color, border: `1px solid ${task.column.color}40` }
                : { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }
              }
              value={task.columnId || ''}
              onChange={(e) => update.mutate({ columnId: e.target.value || undefined })}
            >
              <option value="">—</option>
              {columns.map((col: KanbanColumn) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          )}

          <select
            className="badge cursor-pointer border-none outline-none appearance-none pr-1 text-xs"
            style={{ backgroundColor: `${priorityConf.color}20`, color: priorityConf.color, border: `1px solid ${priorityConf.color}40` }}
            value={task.priority}
            onChange={(e) => update.mutate({ priority: e.target.value as Task['priority'] })}
          >
            {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
              <option key={v} value={v}>{t(`priority_${v.toLowerCase()}` as any)}</option>
            ))}
          </select>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-2.5">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-0.5">{t('due_date')}</p>
            <input
              type="datetime-local"
              className="text-sm text-gray-700 bg-transparent border-none outline-none w-full cursor-pointer"
              value={task.dueDate ? task.dueDate.slice(0, 16) : ''}
              onChange={(e) => update.mutate({ dueDate: e.target.value || undefined })}
            />
          </div>
          {task.dueDate && new Date(task.dueDate) < new Date() && !task.completed && (
            <AlertCircle size={14} className="text-red-400 shrink-0" />
          )}
        </div>

        {task.list && (
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: task.list.color }} />
            <span className="text-sm text-gray-600">{task.list.name}</span>
          </div>
        )}

        {/* Description */}
        <div>
          <p className="label">{t('description')}</p>
          <Textarea
            placeholder={t('description_placeholder')}
            className="min-h-[100px] text-sm"
            defaultValue={task.description || ''}
            onBlur={(e) => {
              const val = e.target.value
              if (val !== (task.description || '')) update.mutate({ description: val || undefined })
            }}
          />
        </div>

        {/* URL */}
        <div>
          <p className="label flex items-center gap-1.5"><Link2 size={11} /> {t('url')}</p>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('url_placeholder')}
              className="text-sm flex-1"
              defaultValue={task.url || ''}
              onBlur={(e) => {
                const val = e.target.value
                if (val !== (task.url || '')) update.mutate({ url: val || undefined })
              }}
            />
            {task.url && (
              <a href={task.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <p className="label flex items-center gap-1.5"><Tag size={11} /> {t('categories')}</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat: Category) => {
              const selected = taskCategoryIds.includes(cat.id)
              return (
                <button key={cat.id} type="button"
                  onClick={() => {
                    const newIds = selected ? taskCategoryIds.filter((id) => id !== cat.id) : [...taskCategoryIds, cat.id]
                    update.mutate({ categoryIds: newIds })
                  }}
                  className="badge transition-all cursor-pointer"
                  style={selected
                    ? { backgroundColor: cat.color, color: 'white', border: `1px solid ${cat.color}` }
                    : { backgroundColor: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }
                  }
                >
                  {cat.name}
                </button>
              )
            })}
            {categories.length === 0 && <p className="text-xs text-gray-400">{t('no_categories')}</p>}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label flex items-center gap-1.5"><Paperclip size={11} /> {t('attachments')}</p>
            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-500 hover:text-blue-600 font-medium" disabled={uploadFile.isPending}>
              {uploadFile.isPending ? t('uploading') : t('add_file')}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>

          {task.attachments.length === 0 ? (
            <p className="text-xs text-gray-400">{t('no_attachments')}</p>
          ) : (
            <div className="space-y-2">
              {task.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <Paperclip size={13} className="text-gray-400 shrink-0" />
                  <span className="flex-1 text-xs text-gray-700 truncate">{att.originalName}</span>
                  <span className="text-xs text-gray-400 shrink-0">{formatFileSize(att.size)}</span>
                  <a href={tasksApi.downloadAttachment(att.id)} download={att.originalName} className="p-1 text-gray-300 hover:text-blue-500 transition-colors">
                    <Download size={13} />
                  </a>
                  <button onClick={() => deleteAttachment.mutate(att.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
        {t('created')} {format(new Date(task.createdAt), 'MMM d, yyyy')}
        {task.updatedAt !== task.createdAt && ` · ${t('updated')} ${format(new Date(task.updatedAt), 'MMM d')}`}
      </div>
    </aside>
  )
}
