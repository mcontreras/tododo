import { api } from './client'
import { User } from '../types'

export const usersApi = {
  getMe: () => api.get<User>('/auth/me').then((r) => r.data),

  updateMe: (data: { name?: string }) =>
    api.patch<User>('/auth/me', data).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/me', { currentPassword, newPassword }),

  deleteMe: (password: string) =>
    api.delete('/auth/me', { data: { password } }),
}
