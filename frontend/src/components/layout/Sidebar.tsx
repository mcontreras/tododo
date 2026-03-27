import { useState, useRef } from 'react'
import { Inbox, List, Tag, Plus, Trash2, Settings, ChevronDown, LayoutGrid, Sun, BarChart2, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listsApi } from '../../api/lists'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useI18n } from '../../store/i18nStore'
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
                  icon === id ? 'shadow-sm text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}
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
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white shadow-sm">
        <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: list.color }}>
          <ListIcon icon={list.icon} size={11} />
        </span>
        <input
          ref={inputRef} autoFocus value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          className="flex-1 text-sm bg-transparent outline-none border-b border-blue-300 min-w-0"
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
        <button onClick={startEdit} className="p-0.5 rounded text-gray-300 hover:text-blue-400 transition-colors">
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
            <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z"/>
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); deleteList.mutate() }}
          className="p-0.5 rounded text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [showCreateList, setShowCreateList] = useState(false)
  const [showLists, setShowLists] = useState(true)
  const { selectedListId, setSelectedList } = useUIStore()
  const { user, logout } = useAuthStore()
  const { t } = useI18n()

  const { data: lists = [] } = useQuery({ queryKey: ['lists'], queryFn: listsApi.getAll })

  return (
    <aside className="flex flex-col h-full bg-surface-secondary border-r border-gray-200/80 select-none">
      {/* User */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/80 transition-colors" title={t('sign_out')}>
            <Settings size={15} />
          </button>
        </div>
      </div>

      <div className="px-3 pb-2 space-y-0.5">
        <button onClick={() => setSelectedList(null)} className={cn('sidebar-item w-full', !selectedListId && 'active')}>
          <Inbox size={16} className="text-blue-500 shrink-0" />
          <span className="flex-1 text-left">{t('all_tasks')}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="flex items-center justify-between py-2 px-1 mb-1">
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
            onClick={() => setShowLists((v) => !v)}
          >
            <ChevronDown size={12} className={cn('transition-transform', !showLists && '-rotate-90')} />
            {t('my_lists')}
          </button>
          <button onClick={() => setShowCreateList(true)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/80 transition-colors">
            <Plus size={14} />
          </button>
        </div>

        {showLists && (
          <div className="space-y-0.5">
            {lists.map((list: ListType) => (
              <ListItem
                key={list.id}
                list={list}
                isSelected={selectedListId === list.id}
                onClick={() => setSelectedList(list.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200/80">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <img src="/logo.svg" alt="Tododo" className="w-4 h-4 opacity-60" />
          <span className="font-medium text-gray-500">Tododo</span>
        </div>
      </div>

      <CreateListModal open={showCreateList} onClose={() => setShowCreateList(false)} />
    </aside>
  )
}
