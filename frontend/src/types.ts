export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'

export type RecurrenceType = 'daily' | 'weekly' | 'monthly'

export interface RecurrenceConfig {
  type: RecurrenceType
  interval: number        // every N days / weeks / months
  weekDays?: number[]     // ISO: 1=Mon … 7=Sun (only for weekly)
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  createdAt: string
}

export interface List {
  id: string
  userId: string
  name: string
  color: string
  icon: string
  position: number
  createdAt: string
  updatedAt: string
  _count?: { tasks: number }
}

export interface Category {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
  _count?: { tasks: number }
}

export interface KanbanColumn {
  id: string
  userId: string
  name: string
  color: string
  position: number
  createdAt: string
  updatedAt: string
  _count?: { tasks: number }
}

export interface Attachment {
  id: string
  taskId: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  createdAt: string
}

export interface TaskCategory {
  taskId: string
  categoryId: string
  category: Category
}

export interface Task {
  id: string
  userId: string
  listId: string | null
  columnId: string | null
  title: string
  description: string | null
  url: string | null
  dueDate: string | null
  priority: Priority
  position: number
  recurrence: RecurrenceConfig | null
  completed: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
  categories: TaskCategory[]
  attachments: Attachment[]
  list: { id: string; name: string; color: string } | null
  column: { id: string; name: string; color: string } | null
}
