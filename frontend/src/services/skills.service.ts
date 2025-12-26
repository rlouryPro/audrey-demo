import { api } from './api'

export type SkillStatus = 'IN_PROGRESS' | 'PENDING_VALIDATION' | 'ACQUIRED' | 'REJECTED'

export interface Skill {
  id: string
  name: string
  description: string
  iconName: string
  displayOrder: number
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  description?: string | null
  displayOrder: number
  skills: Skill[]
}

export interface Domain {
  id: string
  name: string
  description?: string | null
  displayOrder: number
  categories: Category[]
}

export interface UserSkill {
  id: string
  skillId: string
  status: SkillStatus
  requestedAt: string
  validatedAt?: string | null
  rejectedReason?: string | null
  skill: {
    id: string
    name: string
    description: string
    iconName: string
    category: {
      id: string
      name: string
      domain: {
        id: string
        name: string
      }
    }
  }
}

export interface SkillsSummary {
  acquired: number
  inProgress: number
  pendingValidation: number
  rejected: number
}

export interface MySkillsResponse {
  avatarLevel: number
  summary: SkillsSummary
  skills: UserSkill[]
}

export const skillsService = {
  async getHierarchy(): Promise<Domain[]> {
    const response = await api.get<Domain[]>('/domains')
    return response.data
  },

  async getMySkills(): Promise<MySkillsResponse> {
    const response = await api.get<MySkillsResponse>('/my-skills')
    return response.data
  },

  async startSkill(skillId: string): Promise<UserSkill> {
    const response = await api.post<UserSkill>(`/my-skills/${skillId}`, { status: 'IN_PROGRESS' })
    return response.data
  },

  async requestValidation(skillId: string): Promise<UserSkill> {
    const response = await api.patch<UserSkill>(`/my-skills/${skillId}`, { status: 'PENDING_VALIDATION' })
    return response.data
  },

  async abandonSkill(skillId: string): Promise<void> {
    await api.delete(`/my-skills/${skillId}`)
  },
}
