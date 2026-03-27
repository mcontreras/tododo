import { useUIStore } from '../store/uiStore'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { TaskList } from '../components/tasks/TaskList'
import { TaskDetail } from '../components/tasks/TaskDetail'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { useTaskNotifications } from '../hooks/useTaskNotifications'
import { cn } from '../components/ui/cn'

export function DashboardPage() {
  const { view, selectedTaskId, sidebarOpen } = useUIStore()
  useTaskNotifications()

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          'transition-all duration-200 overflow-hidden shrink-0',
          sidebarOpen ? 'w-[260px]' : 'w-0',
          // On mobile: overlay
          'fixed inset-y-0 left-0 z-20 md:relative md:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ width: sidebarOpen ? 260 : 0 }}
      >
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => useUIStore.getState().toggleSidebar()}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {view === 'list' ? <TaskList /> : <KanbanBoard />}

          {/* Detail panel */}
          {selectedTaskId && (
            <div className="w-[340px] shrink-0 overflow-y-auto hidden lg:block">
              <TaskDetail />
            </div>
          )}
        </div>
      </div>

      {/* Mobile task detail (full screen overlay) */}
      {selectedTaskId && (
        <div className="fixed inset-0 z-30 bg-white lg:hidden overflow-y-auto">
          <TaskDetail />
        </div>
      )}
    </div>
  )
}
