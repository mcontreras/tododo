import { List, Columns, EyeOff, Eye, Menu, Languages, Bell, BellOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listsApi } from '../../api/lists'
import { useUIStore } from '../../store/uiStore'
import { useI18n } from '../../store/i18nStore'
import { useNotifStore, enableNotifications } from '../../hooks/useTaskNotifications'
import { notificationService } from '../../services/notificationService'
import { cn } from '../ui/cn'

export function Header() {
  const { selectedListId, view, setView, showCompleted, toggleShowCompleted, toggleSidebar } = useUIStore()
  const { t, locale, setLocale } = useI18n()
  const { enabled, toggle } = useNotifStore()
  const { data: lists = [] } = useQuery({ queryKey: ['lists'], queryFn: listsApi.getAll })

  const currentList = lists.find((l) => l.id === selectedListId)
  const title = currentList?.name || t('all_tasks')
  const color = currentList?.color || '#3B82F6'
  const isDenied = notificationService.isDenied()

  async function handleBellClick() {
    if (isDenied) return
    if (!enabled && !notificationService.hasPermission()) {
      await enableNotifications()
    } else {
      toggle()
    }
  }

  return (
    <header className="flex items-center gap-3 px-5 py-3.5 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
      <button onClick={toggleSidebar} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors md:hidden">
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {currentList && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />}
        <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Notification bell */}
        {notificationService.isSupported() && (
          <button
            onClick={handleBellClick}
            disabled={isDenied}
            title={isDenied ? t('notif_denied') : enabled ? t('notifications') : t('notif_enable')}
            className={cn(
              'relative p-1.5 rounded-lg transition-colors',
              isDenied
                ? 'text-gray-200 cursor-not-allowed'
                : enabled
                  ? 'text-blue-500 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            )}
          >
            {enabled ? <Bell size={16} /> : <BellOff size={16} />}
            {enabled && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}
          </button>
        )}

        {/* Language switcher */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          title={t('language')}
        >
          <Languages size={15} />
          <span className="uppercase">{locale}</span>
        </button>

        <button
          onClick={toggleShowCompleted}
          className={cn(
            'p-1.5 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5',
            showCompleted ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          )}
          title={showCompleted ? 'Hide completed' : 'Show completed'}
        >
          {showCompleted ? <Eye size={16} /> : <EyeOff size={16} />}
          <span className="hidden sm:inline text-xs">{t('completed')}</span>
        </button>

        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 ml-1">
          <button
            onClick={() => setView('list')}
            className={cn('p-1.5 rounded-md transition-all', view === 'list' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600')}
            title={t('list_view')}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView('kanban')}
            className={cn('p-1.5 rounded-md transition-all', view === 'kanban' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600')}
            title={t('kanban_view')}
          >
            <Columns size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
