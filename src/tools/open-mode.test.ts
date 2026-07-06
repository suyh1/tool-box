import { describe, expect, it } from 'vitest'
import { shouldOpenToolInDialog } from './open-mode'

describe('tool open mode', () => {
  it('opens tools in a dialog from the directory route', () => {
    expect(shouldOpenToolInDialog('/tools', '/tools/json')).toBe(true)
  })

  it('opens tools in a dialog from category routes', () => {
    expect(shouldOpenToolInDialog('/tools/category/format', '/tools/json')).toBe(true)
  })

  it('keeps direct tool routes navigable as full pages', () => {
    expect(shouldOpenToolInDialog('/tools/json', '/tools/base64')).toBe(false)
  })
})
