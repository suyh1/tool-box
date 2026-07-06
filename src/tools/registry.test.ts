import { describe, expect, it } from 'vitest'
import { getToolById, tools } from './registry'

describe('tool registry', () => {
  it('contains unique ids and paths', () => {
    expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length)
    expect(new Set(tools.map((tool) => tool.path)).size).toBe(tools.length)
  })

  it('looks up tools by id', () => {
    expect(getToolById('json')?.title).toBe('JSON 格式化')
    expect(getToolById('ini-properties')?.title).toBe('INI / Properties 转换')
    expect(getToolById('json-organize')?.title).toBe('JSON 排序 / 去重')
    expect(getToolById('json-patch')?.title).toBe('JSON Patch / Merge Patch')
    expect(getToolById('json-schema-generate')?.title).toBe('JSON Schema 生成器')
    expect(getToolById('json-schema-validate')?.title).toBe('JSON Schema 校验')
    expect(getToolById('jsonpath')?.title).toBe('JSONPath 查询器')
    expect(getToolById('json-type')?.title).toBe('JSON 转类型')
    expect(getToolById('markdown-preview')?.title).toBe('Markdown 预览')
    expect(getToolById('markdown-toc')?.title).toBe('Markdown TOC 生成')
    expect(getToolById('yaml-json')?.title).toBe('YAML / JSON 转换')
    expect(getToolById('cron')?.title).toBe('Cron 表达式解析')
    expect(getToolById('csv-json')?.title).toBe('CSV / JSON 转换')
    expect(getToolById('csv-sql')?.title).toBe('CSV / SQL INSERT 生成')
    expect(getToolById('csv-table')?.title).toBe('CSV 表格查看器')
    expect(getToolById('css')?.title).toBe('CSS 格式化')
    expect(getToolById('curl')?.title).toBe('cURL 转代码')
    expect(getToolById('html')?.title).toBe('HTML 格式化')
    expect(getToolById('sql')?.title).toBe('SQL 格式化')
    expect(getToolById('toml')?.title).toBe('TOML 格式化 / JSON 转换')
    expect(getToolById('xml')?.title).toBe('XML 格式化')
    expect(getToolById('xml-json')?.title).toBe('XML / JSON 转换')
    expect(getToolById('xml-xpath')?.title).toBe('XML 校验 / XPath 测试')
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

  it('registers XML JSON conversion in the XML formatting group', () => {
    expect(getToolById('xml-json')).toMatchObject({
      path: '/tools/xml-json',
      category: 'format',
      group: 'XML',
      aliases: expect.arrayContaining(['xml to json', 'json to xml']),
      order: 60,
      status: 'active',
    })
  })

  it('registers XML XPath in the XML formatting group', () => {
    expect(getToolById('xml-xpath')).toMatchObject({
      path: '/tools/xml-xpath',
      category: 'format',
      group: 'XML',
      aliases: expect.arrayContaining(['xpath tester', 'xml query']),
      order: 70,
      status: 'active',
    })
  })

  it('registers TOML conversion in the config formatting group', () => {
    expect(getToolById('toml')).toMatchObject({
      path: '/tools/toml',
      category: 'format',
      group: 'Config',
      aliases: expect.arrayContaining(['toml formatter', 'toml to json']),
      order: 80,
      status: 'active',
    })
  })

  it('registers INI properties conversion in the config formatting group', () => {
    expect(getToolById('ini-properties')).toMatchObject({
      path: '/tools/ini-properties',
      category: 'format',
      group: 'Config',
      aliases: expect.arrayContaining(['ini converter', 'properties converter']),
      order: 90,
      status: 'active',
    })
  })

  it('registers CSV JSON conversion in the CSV formatting group', () => {
    expect(getToolById('csv-json')).toMatchObject({
      path: '/tools/csv-json',
      category: 'format',
      group: 'CSV',
      aliases: expect.arrayContaining(['csv to json', 'json to csv']),
      order: 100,
      status: 'active',
    })
  })

  it('registers CSV table viewer in the CSV formatting group', () => {
    expect(getToolById('csv-table')).toMatchObject({
      path: '/tools/csv-table',
      category: 'format',
      group: 'CSV',
      aliases: expect.arrayContaining(['csv viewer', 'table preview']),
      order: 110,
      status: 'active',
    })
  })

  it('registers CSV SQL insert generator in the database code group', () => {
    expect(getToolById('csv-sql')).toMatchObject({
      path: '/tools/csv-sql',
      category: 'code',
      group: 'Database',
      aliases: expect.arrayContaining(['csv to sql', 'insert generator']),
      order: 35,
      status: 'active',
    })
  })

  it('registers Markdown preview in the Markdown formatting group', () => {
    expect(getToolById('markdown-preview')).toMatchObject({
      path: '/tools/markdown-preview',
      category: 'format',
      group: 'Markdown',
      aliases: expect.arrayContaining(['markdown renderer', 'md preview']),
      order: 120,
      status: 'active',
    })
  })

  it('registers Markdown TOC generation in the Markdown text group', () => {
    expect(getToolById('markdown-toc')).toMatchObject({
      path: '/tools/markdown-toc',
      category: 'text',
      group: 'Markdown',
      aliases: expect.arrayContaining(['markdown toc', 'table of contents']),
      order: 40,
      status: 'active',
    })
  })

  it('registers HTML formatting in the web markup formatting group', () => {
    expect(getToolById('html')).toMatchObject({
      path: '/tools/html',
      category: 'format',
      group: 'Web Markup',
      aliases: expect.arrayContaining(['html formatter', 'html minifier']),
      order: 130,
      status: 'active',
    })
  })

  it('registers CSS formatting in the web code formatting group', () => {
    expect(getToolById('css')).toMatchObject({
      path: '/tools/css',
      category: 'format',
      group: 'Web Code',
      aliases: expect.arrayContaining(['css formatter', 'css minifier']),
      order: 140,
      status: 'active',
    })
  })
})
