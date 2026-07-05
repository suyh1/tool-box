import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, watchEffect } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'

function systemPrefersDark() {
  if (typeof window === 'undefined') {
    return true
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = useStorage<ThemePreference>('toolbox.theme', 'dark')

  const effectiveTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'system') {
      return systemPrefersDark() ? 'dark' : 'light'
    }

    return theme.value
  })

  function setTheme(nextTheme: ThemePreference) {
    theme.value = nextTheme
  }

  watchEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.documentElement.classList.toggle('dark', effectiveTheme.value === 'dark')
    document.documentElement.classList.toggle('light', effectiveTheme.value === 'light')
  })

  return {
    theme,
    effectiveTheme,
    setTheme,
  }
})
