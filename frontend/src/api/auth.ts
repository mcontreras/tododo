import { api } from './client'
import { User } from '../types'

export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  update: (data: { name?: string; currentPassword?: string; newPassword?: string }) =>
    api.patch<User>('/auth/me', data).then((r) => r.data),
}
