import { api } from './client'
import { Task, Priority, RecurrenceConfig } from '../types'

export interface TaskFilters {
  listId?: string
  columnId?: string
  completed?: boolean
}

export interface CreateTaskData {
  title: string
  listId?: string
  columnId?: string
  description?: string
  url?: string
  dueDate?: string
  priority?: Priority
  categoryIds?: string[]
  recurrence?: RecurrenceConfig
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  completed?: boolean
  position?: number
}

export interface UpdateTaskResult {
  task: Task
  nextTask: Task | null
}

export const tasksApi = {
  getAll: (filters?: TaskFilters) =>
    api.get<Task[]>('/tasks', { params: filters }).then((r) => r.data),

  getById: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),

  create: (data: CreateTaskData) => api.post<Task>('/tasks', data).then((r) => r.data),

  update: (id: string, data: UpdateTaskData) =>
    api.patch<UpdateTaskResult>(`/tasks/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/tasks/${id}`),

  reorder: (ids: string[]) => api.post('/tasks/reorder', { ids }),

  uploadAttachment: (taskId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post(`/tasks/${taskId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  deleteAttachment: (id: string) => api.delete(`/attachments/${id}`),

  downloadAttachment: (id: string) => `/api/attachments/${id}/download`,
}
