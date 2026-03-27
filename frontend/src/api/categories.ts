import { api } from './client'
import { Category } from '../types'

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories').then((r) => r.data),

  create: (data: { name: string; color?: string }) =>
    api.post<Category>('/categories', data).then((r) => r.data),

  update: (id: string, data: Partial<{ name: string; color: string }>) =>
    api.patch<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/categories/${id}`),
}
