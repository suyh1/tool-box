import { describe, expect, it } from 'vitest'
import { createJsonPatch, createMergePatch } from './json-patch'

describe('json patch utilities', () => {
  it('creates JSON Patch add, remove, and replace operations', () => {
    expect(createJsonPatch('{"name":"Ada","age":36,"old":true}', '{"name":"Ada Lovelace","active":true,"age":36}')).toEqual([
      { op: 'remove', path: '/old' },
      { op: 'replace', path: '/name', value: 'Ada Lovelace' },
      { op: 'add', path: '/active', value: true },
    ])
  })

  it('escapes JSON Pointer path segments', () => {
    expect(createJsonPatch('{"a/b":1,"tilde~key":2}', '{"a/b":3}')).toEqual([
      { op: 'remove', path: '/tilde~0key' },
      { op: 'replace', path: '/a~1b', value: 3 },
    ])
  })

  it('creates recursive JSON Merge Patch objects', () => {
    expect(createMergePatch('{"name":"Ada","profile":{"city":"London","zip":"E1"},"old":true}', '{"name":"Ada","profile":{"city":"Paris"}}')).toEqual({
      profile: {
        city: 'Paris',
        zip: null,
      },
      old: null,
    })
  })
})
