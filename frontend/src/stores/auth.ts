import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, type User, type LoginRequest, type RegisterRequest } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isSystemAdmin = computed(() => user.value?.role === 'systemAdmin')
  const isEnterpriseAdmin = computed(() => user.value?.role === 'enterpriseAdmin')
  const isManager = computed(() => user.value?.role === 'manager')
  const isEmployee = computed(() => user.value?.role === 'employee')

  // Actions
  const login = async (credentials: LoginRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authAPI.login(credentials)
      
      user.value = response.user
      token.value = response.token
      
      // Store in localStorage
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authAPI.register(userData)
      
      user.value = response.user
      token.value = response.token
      
      // Store in localStorage
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    error.value = null
    authAPI.logout()
  }

  const loadUserFromStorage = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      } catch (err) {
        // Clear invalid data
        logout()
      }
    }
  }

  const fetchProfile = async () => {
    try {
      loading.value = true
      const response = await authAPI.getProfile()
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'
      // If profile fetch fails, user might be logged out
      if (err.response?.status === 401) {
        logout()
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize store
  loadUserFromStorage()

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isSystemAdmin,
    isEnterpriseAdmin,
    isManager,
    isEmployee,
    // Actions
    login,
    register,
    logout,
    fetchProfile,
    clearError,
    loadUserFromStorage
  }
})
