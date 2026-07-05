import { describe, expect, it } from 'vitest'
import type { ToolDefinition } from './types'
import {
  categoryOrder,
  getCategorySections,
  getGroupedToolsByCategory,
  getSortedTools,
  searchTools,
} from './catalog'

const component = async () => ({ default: {} })

const sampleTools: ToolDefinition[] = [
  {
    id: 'curl',
    title: 'cURL 转代码',
    description: '把常见 cURL 请求转换为代码。',
    path: '/tools/curl',
    category: 'code',
    group: 'HTTP',
    keywords: ['curl', 'fetch'],
    aliases: ['requests'],
    order: 20,
    status: 'active',
    component,
  },
  {
    id: 'json-type',
    title: 'JSON 转类型',
    description: '从 JSON 生成类型。',
    path: '/tools/json-type',
    category: 'code',
    group: 'Types',
    keywords: ['typescript'],
    aliases: ['interface'],
    featured: true,
    order: 10,
    status: 'active',
    component,
  },
  {
    id: 'base64',
    title: 'Base64 编解码',
    description: '编码和解码文本。',
    path: '/tools/base64',
    category: 'encode',
    group: 'Text Encoding',
    keywords: ['base64'],
    order: 10,
    status: 'active',
    component,
  },
]

describe('tool catalog helpers', () => {
  it('orders category sections by category order and omits empty categories', () => {
    const sections = getCategorySections(sampleTools)

    expect(sections.map((section) => section.category)).toEqual(
      categoryOrder.filter((category) => ['encode', 'code'].includes(category)),
    )
    expect(sections.map((section) => section.count)).toEqual([1, 2])
  })

  it('sorts tools by explicit order and title', () => {
    expect(getSortedTools([sampleTools[0], sampleTools[1]]).map((tool) => tool.id)).toEqual([
      'json-type',
      'curl',
    ])
  })

  it('groups category tools by metadata group', () => {
    const groups = getGroupedToolsByCategory(sampleTools, 'code')

    expect(groups).toEqual([
      {
        group: 'Types',
        tools: [sampleTools[1]],
      },
      {
        group: 'HTTP',
        tools: [sampleTools[0]],
      },
    ])
  })

  it('searches title, description, keywords, and aliases', () => {
    expect(searchTools(sampleTools, 'requests').map((tool) => tool.id)).toEqual(['curl'])
    expect(searchTools(sampleTools, '生成类型').map((tool) => tool.id)).toEqual(['json-type'])
    expect(searchTools(sampleTools, 'base64').map((tool) => tool.id)).toEqual(['base64'])
  })

  it('returns no groups for an unknown category', () => {
    expect(getGroupedToolsByCategory(sampleTools, 'format')).toEqual([])
  })
})
