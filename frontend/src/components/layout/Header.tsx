import { List, Columns, EyeOff, Eye, Menu, Languages, Bell, BellOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listsApi } from '../../api/lists'
import { useUIStore } from '../../store/uiStore'
import { useI18n } from '../../store/i18nStore'
import { cn } from '../ui/cn'

export function Header() {
  const { selectedListId, smartFilter, view, setView, showCompleted, toggleShowCompleted, toggleSidebar } = useUIStore()
  const { t, locale, setLocale } = useI18n()
  const { data: lists = [] } = useQuery({ queryKey: ['lists'], queryFn: listsApi.getAll })

  const currentList = lists.find((l) => l.id === selectedListId)
  const smartTitle = smartFilter === 'today' ? t('filter_today') : smartFilter === 'week' ? t('filter_week') : null
  const title = smartTitle ?? currentList?.name ?? t('all_tasks')
  const color = currentList?.color || '#3B82F6'

  return (
    <header className="flex items-center gap-3 px-5 py-3.5 bg-white/80 dark:bg-dark-surface/90 backdrop-blur-sm border-b border-gray-100 dark:border-dark-border sticky top-0 z-10 transition-colors">
      <button onClick={toggleSidebar} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors md:hidden">
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {currentList && !smartFilter && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />}
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Language switcher */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors"
          title={t('language')}
        >
          <Languages size={15} />
          <span className="uppercase">{locale}</span>
        </button>

        <button
          onClick={toggleShowCompleted}
          className={cn(
            'p-1.5 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5',
            showCompleted
              ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-gray-300'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-tertiary'
          )}
        >
          {showCompleted ? <Eye size={16} /> : <EyeOff size={16} />}
          <span className="hidden sm:inline text-xs">{t('completed')}</span>
        </button>

        <div className="flex items-center bg-gray-100 dark:bg-dark-tertiary rounded-lg p-0.5 ml-1 transition-colors">
          <button
            onClick={() => setView('list')}
            className={cn('p-1.5 rounded-md transition-all', view === 'list' ? 'bg-white dark:bg-dark-border shadow-sm text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300')}
            title={t('list_view')}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView('kanban')}
            className={cn('p-1.5 rounded-md transition-all', view === 'kanban' ? 'bg-white dark:bg-dark-border shadow-sm text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300')}
            title={t('kanban_view')}
          >
            <Columns size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
