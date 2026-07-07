import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { resolveToolId } from '@/tools/registry'

const MAX_RECENT_TOOLS = 8

function normalizeToolIds(toolIds: string[]) {
  return [...new Set(toolIds.map((toolId) => resolveToolId(toolId)))]
}

export const useToolsStore = defineStore('tools', () => {
  const favoriteIds = useStorage<string[]>('toolbox.favoriteToolIds', [])
  const recentIds = useStorage<string[]>('toolbox.recentToolIds', [])

  favoriteIds.value = normalizeToolIds(favoriteIds.value)
  recentIds.value = normalizeToolIds(recentIds.value)

  function toggleFavorite(toolId: string) {
    const normalizedToolId = resolveToolId(toolId)

    favoriteIds.value = favoriteIds.value.includes(normalizedToolId)
      ? favoriteIds.value.filter((id) => id !== normalizedToolId)
      : [...favoriteIds.value, normalizedToolId]
  }

  function recordRecent(toolId: string) {
    const normalizedToolId = resolveToolId(toolId)

    recentIds.value = [
      normalizedToolId,
      ...recentIds.value.filter((id) => id !== normalizedToolId),
    ].slice(0, MAX_RECENT_TOOLS)
  }

  return {
    favoriteIds,
    recentIds,
    toggleFavorite,
    recordRecent,
  }
})
