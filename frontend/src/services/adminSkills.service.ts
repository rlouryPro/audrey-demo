import { api } from './api'

export interface AdminDomain {
  id: string
  name: string
  description?: string | null
  displayOrder: number
  categories: AdminCategory[]
}

export interface AdminCategory {
  id: string
  name: string
  description?: string | null
  displayOrder: number
  domainId: string
  skills: AdminSkill[]
}

export interface AdminSkill {
  id: string
  name: string
  description: string
  iconName: string
  displayOrder: number
  isActive: boolean
  categoryId: string
}

export interface CreateDomainData {
  name: string
  description?: string
  displayOrder?: number
}

export interface CreateCategoryData {
  domainId: string
  name: string
  description?: string
  displayOrder?: number
}

export interface CreateSkillData {
  categoryId: string
  name: string
  description: string
  iconName: string
  displayOrder?: number
}

export interface UpdateSkillData {
  name?: string
  description?: string
  iconName?: string
  displayOrder?: number
  isActive?: boolean
}

export const adminSkillsService = {
  // Domains
  async getHierarchy(): Promise<AdminDomain[]> {
    const response = await api.get<AdminDomain[]>('/domains')
    return response.data
  },

  async createDomain(data: CreateDomainData): Promise<AdminDomain> {
    const response = await api.post<AdminDomain>('/domains', data)
    return response.data
  },

  async updateDomain(id: string, data: Partial<CreateDomainData>): Promise<AdminDomain> {
    const response = await api.patch<AdminDomain>(`/domains/${id}`, data)
    return response.data
  },

  async deleteDomain(id: string): Promise<void> {
    await api.delete(`/domains/${id}`)
  },

  // Categories
  async createCategory(data: CreateCategoryData): Promise<AdminCategory> {
    const response = await api.post<AdminCategory>('/domains/categories', data)
    return response.data
  },

  async updateCategory(id: string, data: Partial<Omit<CreateCategoryData, 'domainId'>>): Promise<AdminCategory> {
    const response = await api.patch<AdminCategory>(`/domains/categories/${id}`, data)
    return response.data
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/domains/categories/${id}`)
  },

  // Skills
  async createSkill(data: CreateSkillData): Promise<AdminSkill> {
    const response = await api.post<AdminSkill>('/domains/skills', data)
    return response.data
  },

  async updateSkill(id: string, data: UpdateSkillData): Promise<AdminSkill> {
    const response = await api.patch<AdminSkill>(`/domains/skills/${id}`, data)
    return response.data
  },

  async deleteSkill(id: string): Promise<void> {
    await api.delete(`/domains/skills/${id}`)
  },
}
