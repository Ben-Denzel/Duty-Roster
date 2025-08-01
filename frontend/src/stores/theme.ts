import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<Theme>('system')
  const isDark = ref(false)

  // Initialize theme from localStorage or default to system
  const initializeTheme = () => {
    try {
      const savedTheme = localStorage.getItem('schedulax-theme') as Theme

      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        theme.value = savedTheme
      } else {
        theme.value = 'system'
      }

      updateTheme()
    } catch (error) {
      console.error('Error initializing theme:', error)
      theme.value = 'system'
      updateTheme()
    }
  }

  // Update the actual theme based on current setting
  const updateTheme = () => {
    if (theme.value === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = theme.value === 'dark'
    }

    // Apply theme to document
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }

  // Set theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('schedulax-theme', newTheme)
    updateTheme()
  }

  // Toggle between light and dark (skips system)
  const toggleTheme = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('light')
    } else {
      // If system, toggle to opposite of current system preference
      setTheme(isDark.value ? 'light' : 'dark')
    }
  }

  // Watch theme changes
  watch(theme, updateTheme, { immediate: true })

  // Watch for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (theme.value === 'system') {
      updateTheme()
    }
  })

  // Getters
  const currentTheme = () => theme.value
  const isSystemTheme = () => theme.value === 'system'
  const getThemeIcon = () => {
    if (theme.value === 'system') {
      return 'computer'
    }
    return isDark.value ? 'moon' : 'sun'
  }

  const getThemeLabel = () => {
    switch (theme.value) {
      case 'light':
        return 'Light Mode'
      case 'dark':
        return 'Dark Mode'
      case 'system':
        return 'System Theme'
      default:
        return 'System Theme'
    }
  }

  return {
    // State
    theme,
    isDark,
    
    // Actions
    initializeTheme,
    setTheme,
    toggleTheme,
    updateTheme,
    
    // Getters
    currentTheme,
    isSystemTheme,
    getThemeIcon,
    getThemeLabel
  }
})
