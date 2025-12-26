import { api } from './api'

export interface DocumentPreview {
  user: {
    id: string
    firstName: string
    lastName: string
    avatarLevel: number
    createdAt: string
  }
  events: Array<{
    id: string
    date: string
    title: string
    photoUrl?: string | null
  }>
  acquiredSkills: Array<{
    id: string
    skillName: string
    categoryName: string
    domainName: string
    validatedAt?: string | null
  }>
  generatedAt: string
}

export const documentService = {
  async getPreview(): Promise<DocumentPreview> {
    const response = await api.get<DocumentPreview>('/documents/preview')
    return response.data
  },

  async downloadHtml(): Promise<void> {
    const response = await api.get('/documents/generate', {
      responseType: 'blob',
    })

    // Create download link
    const blob = new Blob([response.data], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `livret-parcours-${new Date().toISOString().slice(0, 10)}.html`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
