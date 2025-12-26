import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  role: 'USER' | 'ADMIN'
  avatarLevel: number
  isActive: boolean
}

export const authService = {
  async login(username: string, password: string): Promise<User> {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { username, password },
      { withCredentials: true }
    )
    return response.data.user
  },

  async logout(): Promise<void> {
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true })
  },

  async me(): Promise<User> {
    const response = await axios.get(`${API_URL}/auth/me`, {
      withCredentials: true,
    })
    return response.data
  },
}
