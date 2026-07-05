import { describe, expect, it } from 'vitest'
import { getToolById, tools } from './registry'

describe('tool registry', () => {
  it('contains unique ids and paths', () => {
    expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length)
    expect(new Set(tools.map((tool) => tool.path)).size).toBe(tools.length)
  })

  it('looks up tools by id', () => {
    expect(getToolById('json')?.title).toBe('JSON Formatter')
    expect(getToolById('missing')).toBeUndefined()
  })

  it('marks completed tools as active and the rest as planned at this stage', () => {
    expect(getToolById('json')?.status).toBe('active')
    expect(getToolById('base64')?.status).toBe('active')
    expect(getToolById('url')?.status).toBe('active')
    expect(getToolById('timestamp')?.status).toBe('active')
    expect(getToolById('jwt')?.status).toBe('active')
    expect(tools.filter((tool) => tool.status === 'planned')).toHaveLength(5)
  })
})
