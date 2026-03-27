import { create } from 'zustand'

type View = 'list' | 'kanban'

interface UIState {
  selectedListId: string | null
  selectedTaskId: string | null
  view: View
  showCompleted: boolean
  sidebarOpen: boolean
  setSelectedList: (id: string | null) => void
  setSelectedTask: (id: string | null) => void
  setView: (view: View) => void
  toggleShowCompleted: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedListId: null,
  selectedTaskId: null,
  view: 'list',
  showCompleted: false,
  sidebarOpen: true,
  setSelectedList: (id) => set({ selectedListId: id, selectedTaskId: null }),
  setSelectedTask: (id) => set({ selectedTaskId: id }),
  setView: (view) => set({ view }),
  toggleShowCompleted: () => set((s) => ({ showCompleted: !s.showCompleted })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
