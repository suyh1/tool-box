import { describe, expect, it } from 'vitest'
import { generateUuid } from './uuid'

describe('uuid utilities', () => {
  it('generates RFC 4122 version 4 UUID values', () => {
    expect(generateUuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('generates unique UUID values in a sample of 50', () => {
    const ids = Array.from({ length: 50 }, () => generateUuid())

    expect(new Set(ids).size).toBe(50)
  })
})
