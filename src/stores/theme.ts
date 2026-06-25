import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')

  const initTheme = () => {
    const saved = localStorage.getItem('themeMode') as ThemeMode | null
    if (saved) {
      mode.value = saved
    }
    applyTheme()
  }

  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', mode.value === 'dark')
  }

  const toggleTheme = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('themeMode', mode.value)
    applyTheme()
  }

  watch(mode, applyTheme)

  return {
    mode,
    initTheme,
    toggleTheme
  }
})
