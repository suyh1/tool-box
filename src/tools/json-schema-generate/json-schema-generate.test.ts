import { describe, expect, it } from 'vitest'
import { generateJsonSchema } from './json-schema-generate'

describe('json schema generation utilities', () => {
  it('infers object properties and required keys from a JSON sample', () => {
    expect(generateJsonSchema('{"name":"Ada","age":36,"active":true,"tags":["admin"]}')).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      required: ['name', 'age', 'active', 'tags'],
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
        active: { type: 'boolean' },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    })
  })

  it('merges array item schemas into union types', () => {
    expect(generateJsonSchema('[{"id":1},{"id":"2","name":"Ada"}]')).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: ['integer', 'string'] },
          name: { type: 'string' },
        },
      },
    })
  })

  it('returns an any schema for empty arrays', () => {
    expect(generateJsonSchema('[]')).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'array',
      items: {},
    })
  })
})
