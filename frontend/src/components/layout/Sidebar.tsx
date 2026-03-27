import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, List, Tag, Plus, Trash2, Settings, ChevronDown, LayoutGrid, Sun, BarChart2, Check, X, CalendarDays, Calendar, Moon, Monitor } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isToday, isThisWeek } from 'date-fns'
import { listsApi } from '../../api/lists'
import { tasksApi } from '../../api/tasks'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useI18n } from '../../store/i18nStore'
import { useThemeStore, applyTheme } from '../../store/themeStore'
import { Task } from '../../types'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ColorPicker } from '../ui/ColorPicker'
import { cn } from '../ui/cn'
import { List as ListType } from '../../types'

const ICONS = [
  { id: 'list', Icon: List }, { id: 'inbox', Icon: Inbox }, { id: 'tag', Icon: Tag },
  { id: 'grid', Icon: LayoutGrid }, { id: 'sun', Icon: Sun }, { id: 'chart', Icon: BarChart2 },
]

function ListIcon({ icon, size = 14 }: { icon: string; size?: number }) {
  const match = ICONS.find((i) => i.id === icon)
  const Icon = match?.Icon || List
  return <Icon size={size} />
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function CreateListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [icon, setIcon] = useState('list')
  const { t } = useI18n()
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: listsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lists'] }); setName(''); onClose() },
  })

  return (
    <Modal open={open} onClose={onClose} title={t('new_list')}>
      <div className="p-6 space-y-4">
        <Input label={t('list_name')} placeholder={t('list_name')} value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <p className="label">{t('color')}</p>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div>
          <p className="label">{t('icon')}</p>
          <div className="flex gap-2 flex-wrap">
            {ICONS.map(({ id, Icon }) => (
              <button key={id} type="button" onClick={() => setIcon(id)}
                className={cn('w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                  icon === id ? 'shadow-sm text-white' : 'bg-gray-100 dark:bg-dark-tertiary text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border')}
                style={icon === id ? { backgroundColor: color } : undefined}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">{t('cancel')}</Button>
          <Button variant="primary" onClick={() => mutation.mutate({ name, color, icon })}
            loading={mutation.isPending} disabled={!name.trim()} className="flex-1">
            {t('create')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ListItem({ list, isSelected, onClick }: { list: ListType; isSelected: boolean; onClick: () => void }) {
  const [editing, setEditing] = useState(false)
  const [nameValue, setNameValue] = useState(list.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const updateList = useMutation({
    mutationFn: (name: string) => listsApi.update(list.id, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lists'] }); setEditing(false) },
  })
  const deleteList = useMutation({
    mutationFn: () => listsApi.delete(list.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  })

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setNameValue(list.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 50)
  }

  function commit() {
    if (nameValue.trim() && nameValue.trim() !== list.name) updateList.mutate(nameValue.trim())
    else setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-dark-secondary shadow-sm">
        <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: list.color }}>
          <ListIcon icon={list.icon} size={11} />
        </span>
        <input
          ref={inputRef} autoFocus value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          className="flex-1 text-sm bg-transparent outline-none border-b border-blue-300 dark:text-gray-200 min-w-0"
        />
        <button onClick={commit} className="p-0.5 text-green-500 hover:text-green-600 shrink-0"><Check size={13} /></button>
        <button onClick={() => setEditing(false)} className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0"><X size={13} /></button>
      </div>
    )
  }

  return (
    <div className={cn('sidebar-item group', isSelected && 'active')} onClick={onClick}>
      <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: list.color }}>
        <ListIcon icon={list.icon} size={11} />
      </span>
      <span className="flex-1 truncate">{list.name}</span>
      {list._count !== undefined && (
        <span className="text-xs text-gray-400 group-hover:hidden">{list._count.tasks || ''}</span>
      )}
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button onClick={startEdit} className="p-0.5 rounded text-gray-300 dark:text-gray-600 hover:text-blue-400 transition-colors">
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
            <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/>
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); deleteList.mutate() }}
          className="p-0.5 rounded text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [showCreateList, setShowCreateList] = useState(false)
  const [showLists, setShowLists] = useState(true)
  const { selectedListId, smartFilter, setSelectedList, setSmartFilter } = useUIStore()
  const { user } = useAuthStore()
  const { t } = useI18n()
  const { mode, setMode } = useThemeStore()
  const navigate = useNavigate()

  const { data: lists = [] } = useQuery({ queryKey: ['lists'], queryFn: listsApi.getAll })
  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks', {}],
    queryFn: () => tasksApi.getAll(),
    select: (tasks: Task[]) => tasks.filter((t) => !t.completed),
  })
  const todayCount = allTasks.filter((t: Task) => t.dueDate && isToday(new Date(t.dueDate))).length
  const weekCount = allTasks.filter((t: Task) => t.dueDate && isThisWeek(new Date(t.dueDate), { weekStartsOn: 1 })).length

  function cycleTheme() {
    const next = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
    setMode(next)
    applyTheme(next)
  }

  const ThemeIcon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor

  return (
    <aside className="flex flex-col h-full bg-surface-secondary dark:bg-dark-secondary border-r border-gray-200/80 dark:border-dark-border select-none transition-colors">
      {/* User */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-dark-tertiary transition-colors"
            title={t('profile_settings')}
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Smart filters */}
      <div className="px-3 pb-2 space-y-0.5">
        <button onClick={() => setSelectedList(null)} className={cn('sidebar-item w-full', !selectedListId && !smartFilter && 'active')}>
          <Inbox size={16} className="text-blue-500 shrink-0" />
          <span className="flex-1 text-left">{t('all_tasks')}</span>
        </button>
        <button onClick={() => setSmartFilter('today')} className={cn('sidebar-item w-full', smartFilter === 'today' && 'active')}>
          <CalendarDays size={16} className="text-orange-400 shrink-0" />
          <span className="flex-1 text-left">{t('filter_today')}</span>
          {todayCount > 0 && <span className="text-xs font-semibold text-orange-400 bg-orange-50 dark:bg-orange-400/10 px-1.5 py-0.5 rounded-full">{todayCount}</span>}
        </button>
        <button onClick={() => setSmartFilter('week')} className={cn('sidebar-item w-full', smartFilter === 'week' && 'active')}>
          <Calendar size={16} className="text-violet-400 shrink-0" />
          <span className="flex-1 text-left">{t('filter_week')}</span>
          {weekCount > 0 && <span className="text-xs font-semibold text-violet-400 bg-violet-50 dark:bg-violet-400/10 px-1.5 py-0.5 rounded-full">{weekCount}</span>}
        </button>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="flex items-center justify-between py-2 px-1 mb-1">
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 uppercase tracking-wider transition-colors"
            onClick={() => setShowLists((v) => !v)}
          >
            <ChevronDown size={12} className={cn('transition-transform', !showLists && '-rotate-90')} />
            {t('my_lists')}
          </button>
          <button
            onClick={() => setShowCreateList(true)}
            className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-dark-tertiary transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        {showLists && (
          <div className="space-y-0.5">
            {lists.map((list: ListType) => (
              <ListItem key={list.id} list={list} isSelected={selectedListId === list.id} onClick={() => setSelectedList(list.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom: logo + dark mode toggle */}
      <div className="px-4 py-3 border-t border-gray-200/80 dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Tododo" className="w-7 h-7 rounded-lg object-contain" />
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tododo</span>
          <button
            onClick={cycleTheme}
            className="ml-auto p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-dark-tertiary transition-colors"
            title={`${t('theme')}: ${t(`theme_${mode}` as any)}`}
          >
            <ThemeIcon size={15} />
          </button>
        </div>
      </div>

      <CreateListModal open={showCreateList} onClose={() => setShowCreateList(false)} />
    </aside>
  )
}
