import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useToolsStore } from './tools'

describe('useToolsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('toggles favorite tool ids without duplicates', () => {
    const store = useToolsStore()

    store.toggleFavorite('json')
    store.toggleFavorite('json')
    store.toggleFavorite('base64')

    expect(store.favoriteIds).toEqual(['base64'])
  })

  it('normalizes merged tool ids in favorites', () => {
    const store = useToolsStore()

    store.toggleFavorite('jwt-sign')
    store.toggleFavorite('jwt')
    store.toggleFavorite('qr-decode')

    expect(store.favoriteIds).toEqual(['qr-code'])
  })

  it('records recent tools with newest first and a max of eight', () => {
    const store = useToolsStore()

    for (const id of ['json', 'base64', 'url', 'timestamp', 'jwt', 'hash', 'uuid', 'regex', 'diff']) {
      store.recordRecent(id)
    }

    expect(store.recentIds).toEqual(['diff', 'regex', 'uuid', 'hash', 'jwt', 'timestamp', 'url', 'base64'])
  })

  it('normalizes merged tool ids in recent tools', () => {
    const store = useToolsStore()

    store.recordRecent('url-parser')
    store.recordRecent('query-editor')
    store.recordRecent('csv-sql')

    expect(store.recentIds).toEqual(['csv-json', 'url'])
  })
})
