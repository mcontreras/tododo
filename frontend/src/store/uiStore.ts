import { create } from 'zustand'

type View = 'list' | 'kanban'
export type SmartFilter = 'today' | 'week'

interface UIState {
  selectedListId: string | null
  smartFilter: SmartFilter | null
  selectedTaskId: string | null
  view: View
  showCompleted: boolean
  sidebarOpen: boolean
  setSelectedList: (id: string | null) => void
  setSmartFilter: (filter: SmartFilter | null) => void
  setSelectedTask: (id: string | null) => void
  setView: (view: View) => void
  toggleShowCompleted: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedListId: null,
  smartFilter: null,
  selectedTaskId: null,
  view: 'list',
  showCompleted: false,
  sidebarOpen: true,
  setSelectedList: (id) => set({ selectedListId: id, smartFilter: null, selectedTaskId: null }),
  setSmartFilter: (filter) => set({ smartFilter: filter, selectedListId: null, selectedTaskId: null }),
  setSelectedTask: (id) => set({ selectedTaskId: id }),
  setView: (view) => set({ view }),
  toggleShowCompleted: () => set((s) => ({ showCompleted: !s.showCompleted })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
