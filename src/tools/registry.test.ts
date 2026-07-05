import { describe, expect, it } from 'vitest'
import { getToolById, tools } from './registry'

describe('tool registry', () => {
  it('contains unique ids and paths', () => {
    expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length)
    expect(new Set(tools.map((tool) => tool.path)).size).toBe(tools.length)
  })

  it('looks up tools by id', () => {
    expect(getToolById('json')?.title).toBe('JSON 格式化')
    expect(getToolById('json-organize')?.title).toBe('JSON 排序 / 去重')
    expect(getToolById('json-patch')?.title).toBe('JSON Patch / Merge Patch')
    expect(getToolById('json-schema-generate')?.title).toBe('JSON Schema 生成器')
    expect(getToolById('json-schema-validate')?.title).toBe('JSON Schema 校验')
    expect(getToolById('jsonpath')?.title).toBe('JSONPath 查询器')
    expect(getToolById('json-type')?.title).toBe('JSON 转类型')
    expect(getToolById('yaml-json')?.title).toBe('YAML / JSON 转换')
    expect(getToolById('cron')?.title).toBe('Cron 表达式解析')
    expect(getToolById('curl')?.title).toBe('cURL 转代码')
    expect(getToolById('sql')?.title).toBe('SQL 格式化')
    expect(getToolById('xml')?.title).toBe('XML 格式化')
    expect(getToolById('missing')).toBeUndefined()
  })

  it('marks all initial tools as active', () => {
    expect(tools.every((tool) => tool.status === 'active')).toBe(true)
    expect(tools.filter((tool) => tool.status === 'planned')).toHaveLength(0)
  })

  it('includes catalog metadata for directory browsing', () => {
    for (const tool of tools) {
      expect(tool.group, `${tool.id} group`).toBeTruthy()
      expect(tool.order, `${tool.id} order`).toEqual(expect.any(Number))
      expect(tool.keywords.length, `${tool.id} keywords`).toBeGreaterThan(0)
    }
  })

  it('registers JSON organize in the JSON / YAML formatting group', () => {
    expect(getToolById('json-organize')).toMatchObject({
      path: '/tools/json-organize',
      category: 'format',
      group: 'JSON / YAML',
      aliases: expect.arrayContaining(['json sort', 'json dedupe', 'json path']),
      order: 15,
      status: 'active',
    })
  })

  it('registers JSONPath in the query code group', () => {
    expect(getToolById('jsonpath')).toMatchObject({
      path: '/tools/jsonpath',
      category: 'code',
      group: 'Query',
      aliases: expect.arrayContaining(['json query', 'json path tester']),
      order: 30,
      status: 'active',
    })
  })

  it('registers JSON Schema validation in the schema formatting group', () => {
    expect(getToolById('json-schema-validate')).toMatchObject({
      path: '/tools/json-schema-validate',
      category: 'format',
      group: 'Schema',
      aliases: expect.arrayContaining(['json schema validator', 'schema validation']),
      order: 40,
      status: 'active',
    })
  })

  it('registers JSON Schema generation in the schema code group', () => {
    expect(getToolById('json-schema-generate')).toMatchObject({
      path: '/tools/json-schema-generate',
      category: 'code',
      group: 'Schema',
      aliases: expect.arrayContaining(['schema generator', 'json schema infer']),
      order: 40,
      status: 'active',
    })
  })

  it('registers JSON Patch in the JSON / YAML code group', () => {
    expect(getToolById('json-patch')).toMatchObject({
      path: '/tools/json-patch',
      category: 'code',
      group: 'JSON / YAML',
      aliases: expect.arrayContaining(['json diff', 'rfc6902', 'rfc7396']),
      order: 50,
      status: 'active',
    })
  })

  it('registers XML formatting in the XML formatting group', () => {
    expect(getToolById('xml')).toMatchObject({
      path: '/tools/xml',
      category: 'format',
      group: 'XML',
      aliases: expect.arrayContaining(['xml formatter', 'xml validator']),
      order: 50,
      status: 'active',
    })
  })
})
