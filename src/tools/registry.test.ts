import { describe, expect, it } from 'vitest'
import {
  getToolById,
  getToolByPath,
  legacyToolRedirects,
  resolveToolId,
  resolveToolPath,
  tools,
} from './registry'

const mergedToolIds = [
  'brotli',
  'qr-decode',
  'jwt-sign',
  'csr',
  'rsa-sign',
  'hmac',
  'snowflake',
  'ulid',
  'nanoid',
  'palette',
  'contrast',
  'passphrase',
  'random-string',
  'graphql-variables',
  'markdown-toc',
  'url-parser',
  'query-editor',
  'cookie-parser',
  'user-agent',
  'xml-json',
  'xml-xpath',
  'csv-table',
  'csv-sql',
  'regex-helper',
  'slug',
  'pinyin',
  'list-random',
  'delimiter-convert',
  'kubernetes-yaml',
  'ip-convert',
]

describe('tool registry', () => {
  it('contains unique ids and paths for visible tools', () => {
    expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length)
    expect(new Set(tools.map((tool) => tool.path)).size).toBe(tools.length)
  })

  it('consolidates overlapping tools into visible workbenches', () => {
    expect(tools).toHaveLength(70)
    expect(tools.some((tool) => mergedToolIds.includes(tool.id))).toBe(false)
  })

  it('keeps all visible tools active and browsable', () => {
    expect(tools.every((tool) => tool.status === 'active')).toBe(true)
    expect(tools.every((tool) => tool.group)).toBe(true)
    expect(tools.every((tool) => typeof tool.order === 'number')).toBe(true)
    expect(tools.every((tool) => tool.keywords.length > 0)).toBe(true)
  })

  it('looks up representative standalone tools by id', () => {
    expect(getToolById('json')?.title).toBe('JSON 格式化')
    expect(getToolById('base64')?.title).toBe('Base64 编解码')
    expect(getToolById('timestamp')?.title).toBe('时间戳转换')
    expect(getToolById('yaml-json')?.title).toBe('YAML / JSON 转换')
    expect(getToolById('json-schema-validate')?.title).toBe('JSON Schema 校验')
    expect(getToolById('missing')).toBeUndefined()
  })

  it('registers merged workbenches with searchable metadata', () => {
    expect(getToolById('url')).toMatchObject({
      title: 'URL 工作台',
      path: '/tools/url',
      aliases: expect.arrayContaining(['url parse', 'query params']),
      component: expect.any(Function),
    })
    expect(getToolById('color')).toMatchObject({
      title: '颜色工作台',
      aliases: expect.arrayContaining(['palette generator', 'wcag contrast']),
    })
    expect(getToolById('line-tools')).toMatchObject({
      title: '列表工具',
      aliases: expect.arrayContaining(['shuffle list', 'delimiter converter']),
    })
    expect(getToolById('jwt')).toMatchObject({
      title: 'JWT 工作台',
      aliases: expect.arrayContaining(['jwt sign', 'jwt verify']),
    })
    expect(getToolById('csv-json')).toMatchObject({
      title: 'CSV 工作台',
      aliases: expect.arrayContaining(['csv viewer', 'insert generator']),
    })
  })

  it('keeps legacy ids and paths mapped to their merged workbenches', () => {
    expect(legacyToolRedirects['/tools/url-parser']).toBe('/tools/url')
    expect(legacyToolRedirects['/tools/qr-decode']).toBe('/tools/qr-code')
    expect(legacyToolRedirects['/tools/kubernetes-yaml']).toBe('/tools/docker-compose')
    expect(resolveToolId('jwt-sign')).toBe('jwt')
    expect(resolveToolId('missing')).toBe('missing')
    expect(resolveToolPath('/tools/csv-sql')).toBe('/tools/csv-json')
    expect(resolveToolPath('/tools/missing')).toBe('/tools/missing')
    expect(getToolByPath('/tools/url-parser')).toBeUndefined()
  })
})
