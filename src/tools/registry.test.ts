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

  it('marks json as an active tool and the rest as planned at this stage', () => {
    expect(getToolById('json')?.status).toBe('active')
    expect(tools.filter((tool) => tool.status === 'planned')).toHaveLength(9)
  })
})
