import { describe, expect, it } from 'vitest'
import { validateJsonSchema } from './json-schema-validate'

describe('json schema validation utilities', () => {
  const schema = JSON.stringify({
    type: 'object',
    required: ['name', 'age', 'role'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 2 },
      age: { type: 'number', minimum: 18 },
      role: { enum: ['admin', 'editor'] },
    },
  })

  it('returns valid when data satisfies a schema', () => {
    expect(validateJsonSchema('{"name":"Ada","age":36,"role":"admin"}', schema)).toEqual({
      valid: true,
      errors: [],
    })
  })

  it('reports missing required properties and invalid constraints', () => {
    expect(validateJsonSchema('{"name":"A","age":16,"extra":true}', schema)).toEqual({
      valid: false,
      errors: [
        {
          path: '$.role',
          message: '缺少必填字段',
        },
        {
          path: '$.name',
          message: '长度应至少为 2',
        },
        {
          path: '$.age',
          message: '应大于或等于 18',
        },
        {
          path: '$.extra',
          message: '不允许额外字段',
        },
      ],
    })
  })

  it('supports nested arrays and item schemas', () => {
    const nestedSchema = JSON.stringify({
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' },
        },
      },
    })

    expect(validateJsonSchema('[{"id":1},{"id":"2"}]', nestedSchema)).toMatchObject({
      valid: false,
      errors: [
        {
          path: '$[1].id',
          message: '应为 integer',
        },
      ],
    })
  })
})
