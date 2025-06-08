import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface User {
  uid: number
  username: string
  trueName: string
  sex: string
  telephone: string
  birth: string
  dept: string
  role: number
  balance: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))

  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role !== 1)

  const loadUserFromStorage = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      user.value = JSON.parse(userStr)
    }
  }

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/users/info')
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      return false
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      })

      token.value = response.data.token
      localStorage.setItem('token', token.value)

      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      const success = await fetchUserInfo()

      return success
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
      user.value = null

      localStorage.removeItem('token')
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
    fetchUserInfo,
  }
})
