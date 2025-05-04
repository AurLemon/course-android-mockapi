import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface User {
  uid: number
  username: string
  role: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 0)

  const loadUserFromStorage = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      user.value = JSON.parse(userStr)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      })
      const data = response.data.data

      token.value = data.access_token
      refreshToken.value = data.refresh_token
      user.value = data.user

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refreshToken', data.refresh_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      axios.defaults.headers.common['Authorization'] =
        `Bearer ${data.access_token}`

      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await axios.get('/api/users/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      refreshToken.value = null
      user.value = null

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      delete axios.defaults.headers.common['Authorization']
    }
  }

  loadUserFromStorage()
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    login,
    logout,
  }
})
