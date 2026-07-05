import { describe, expect, it } from 'vitest'
import { getJsonPathEntries, organizeJson } from './json-organize'

describe('json organize utilities', () => {
  it('sorts object keys recursively while preserving array order', () => {
    const result = organizeJson('{"z":1,"a":{"d":4,"b":2},"items":[{"name":"B","id":2},{"name":"A","id":1}]}', {
      sortKeys: true,
    })

    expect(result.output).toBe(`{
  "a": {
    "b": 2,
    "d": 4
  },
  "items": [
    {
      "id": 2,
      "name": "B"
    },
    {
      "id": 1,
      "name": "A"
    }
  ],
  "z": 1
}`)
    expect(result.stats.sortedObjectCount).toBe(4)
  })

  it('deduplicates array values by structural equality and keeps the first value', () => {
    const result = organizeJson('[{"b":2,"a":1},{"a":1,"b":2},["x","x"],["x","x"],1,1]', {
      dedupeArrays: true,
      sortKeys: true,
    })

    expect(result.output).toBe(`[
  {
    "a": 1,
    "b": 2
  },
  [
    "x"
  ],
  1
]`)
    expect(result.stats.dedupedArrayCount).toBe(2)
    expect(result.stats.removedItemCount).toBe(4)
  })

  it('lists copyable JSON paths with stable previews', () => {
    expect(getJsonPathEntries('{"user-name":{"roles":["admin"],"active":true}}')).toEqual([
      {
        path: '$["user-name"]',
        kind: 'object',
        depth: 1,
        preview: '{2 keys}',
      },
      {
        path: '$["user-name"].roles',
        kind: 'array',
        depth: 2,
        preview: '[1 item]',
      },
      {
        path: '$["user-name"].roles[0]',
        kind: 'string',
        depth: 3,
        preview: '"admin"',
      },
      {
        path: '$["user-name"].active',
        kind: 'boolean',
        depth: 2,
        preview: 'true',
      },
    ])
  })
})
