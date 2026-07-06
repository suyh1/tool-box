import { describe, expect, it } from 'vitest'
import { validateOpenApiSpec } from './openapi-viewer'

describe('validateOpenApiSpec', () => {
  it('parses YAML OpenAPI specs and summarizes operations', () => {
    const result = validateOpenApiSpec(`
openapi: 3.0.3
info:
  title: Demo API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
    post:
      summary: Create user
`)

    expect(result).toEqual({
      ok: true,
      title: 'Demo API',
      version: '1.0.0',
      openapi: '3.0.3',
      pathCount: 1,
      operationCount: 2,
      operations: [
        { method: 'GET', path: '/users', summary: 'List users' },
        { method: 'POST', path: '/users', summary: 'Create user' },
      ],
      warnings: [],
    })
  })

  it('reports missing required top-level sections', () => {
    expect(validateOpenApiSpec('openapi: 3.0.3')).toEqual({
      ok: false,
      message: 'OpenAPI 文档缺少 info 和 paths。',
    })
  })
})
