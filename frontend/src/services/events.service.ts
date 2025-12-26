import { api } from './api'

export interface Event {
  id: string
  date: string
  title: string
  description?: string | null
  photoUrl?: string | null
  thumbnailUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEventData {
  date: string
  title: string
  description?: string
  photo?: File
}

export interface UpdateEventData {
  date?: string
  title?: string
  description?: string
  photo?: File
}

export const eventsService = {
  async getAll(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events')
    return response.data
  },

  async getById(id: string): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`)
    return response.data
  },

  async create(data: CreateEventData): Promise<Event> {
    const formData = new FormData()
    formData.append('date', data.date)
    formData.append('title', data.title)
    if (data.description) {
      formData.append('description', data.description)
    }
    if (data.photo) {
      formData.append('photo', data.photo)
    }

    const response = await api.post<Event>('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async update(id: string, data: UpdateEventData): Promise<Event> {
    const formData = new FormData()
    if (data.date) formData.append('date', data.date)
    if (data.title) formData.append('title', data.title)
    if (data.description !== undefined) formData.append('description', data.description || '')
    if (data.photo) formData.append('photo', data.photo)

    const response = await api.patch<Event>(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/events/${id}`)
  },
}
