import { api } from './api'

export type Role = 'USER' | 'ADMIN'

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  role: Role
  avatarLevel: number
  isActive: boolean
  createdAt: string
  _count?: {
    events: number
    userSkills: number
  }
}

export interface CreateUserData {
  username: string
  password: string
  firstName: string
  lastName: string
  role: Role
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  role?: Role
  isActive?: boolean
  password?: string
}

export interface PendingValidation {
  id: string
  status: string
  requestedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
  }
  skill: {
    id: string
    name: string
    description: string
    category: {
      name: string
      domain: {
        name: string
      }
    }
  }
}

export const usersService = {
  async getAll(filters?: { role?: Role; isActive?: boolean }): Promise<User[]> {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))

    const response = await api.get<User[]>(`/users?${params.toString()}`)
    return response.data
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await api.post<User>('/users', data)
    return response.data
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data)
    return response.data
  },
}

export const validationsService = {
  async getPending(): Promise<PendingValidation[]> {
    const response = await api.get<PendingValidation[]>('/validations')
    return response.data
  },

  async approve(userSkillId: string): Promise<void> {
    await api.post(`/validations/${userSkillId}/approve`)
  },

  async reject(userSkillId: string, reason: string): Promise<void> {
    await api.post(`/validations/${userSkillId}/reject`, { reason })
  },
}
