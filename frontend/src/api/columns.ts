import { api } from './client'
import { KanbanColumn } from '../types'

export const columnsApi = {
  getAll: () => api.get<KanbanColumn[]>('/columns').then((r) => r.data),

  create: (data: { name: string; color?: string }) =>
    api.post<KanbanColumn>('/columns', data).then((r) => r.data),

  update: (id: string, data: Partial<{ name: string; color: string; position: number }>) =>
    api.patch<KanbanColumn>(`/columns/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/columns/${id}`),
}
