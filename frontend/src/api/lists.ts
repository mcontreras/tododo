import { api } from './client'
import { List } from '../types'

export const listsApi = {
  getAll: () => api.get<List[]>('/lists').then((r) => r.data),

  create: (data: { name: string; color?: string; icon?: string }) =>
    api.post<List>('/lists', data).then((r) => r.data),

  update: (id: string, data: Partial<{ name: string; color: string; icon: string; position: number }>) =>
    api.patch<List>(`/lists/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/lists/${id}`),
}
