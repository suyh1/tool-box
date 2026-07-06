import { describe, expect, it } from 'vitest'
import { generateMockJson } from './mock-json'

describe('mock json generator utilities', () => {
  it('generates mock JSON from a compact schema', () => {
    const result = generateMockJson(`{
      "id": "uuid",
      "name": "name",
      "active": "boolean",
      "score": "number",
      "tags": ["word"]
    }`)

    expect(result).toMatchObject({
      ok: true,
      mode: 'schema',
    })

    if (!result.ok) {
      throw new Error(result.message)
    }

    const value = JSON.parse(result.json)
    expect(value).toMatchObject({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      name: expect.any(String),
      active: expect.any(Boolean),
      score: expect.any(Number),
      tags: [expect.any(String)],
    })
  })

  it('generates mock JSON by preserving the shape of a sample object', () => {
    const result = generateMockJson('{"user":{"name":"Ada"},"count":1,"enabled":true}', { mode: 'sample' })

    if (!result.ok) {
      throw new Error(result.message)
    }

    const value = JSON.parse(result.json)
    expect(value.user.name).toEqual(expect.any(String))
    expect(value.count).toEqual(expect.any(Number))
    expect(value.enabled).toEqual(expect.any(Boolean))
  })

  it('returns readable errors for invalid JSON input', () => {
    expect(generateMockJson('{', { mode: 'schema' })).toMatchObject({
      ok: false,
      message: expect.stringContaining('JSON 无效'),
    })
  })
})
