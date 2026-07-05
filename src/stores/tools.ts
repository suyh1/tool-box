import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

const MAX_RECENT_TOOLS = 8

export const useToolsStore = defineStore('tools', () => {
  const favoriteIds = useStorage<string[]>('toolbox.favoriteToolIds', [])
  const recentIds = useStorage<string[]>('toolbox.recentToolIds', [])

  function toggleFavorite(toolId: string) {
    favoriteIds.value = favoriteIds.value.includes(toolId)
      ? favoriteIds.value.filter((id) => id !== toolId)
      : [...favoriteIds.value, toolId]
  }

  function recordRecent(toolId: string) {
    recentIds.value = [
      toolId,
      ...recentIds.value.filter((id) => id !== toolId),
    ].slice(0, MAX_RECENT_TOOLS)
  }

  return {
    favoriteIds,
    recentIds,
    toggleFavorite,
    recordRecent,
  }
})
