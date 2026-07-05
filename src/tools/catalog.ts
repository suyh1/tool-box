import type { ToolCategory, ToolDefinition } from './types'

export const categoryLabels: Record<ToolCategory, string> = {
  format: '格式化',
  encode: '编码',
  time: '时间',
  security: '安全',
  generate: '生成',
  code: '代码',
  text: '文本',
}

export const categoryOrder: ToolCategory[] = [
  'format',
  'encode',
  'time',
  'security',
  'generate',
  'code',
  'text',
]

export const categoryCodes: Record<ToolCategory, string> = {
  format: 'FMT',
  encode: 'ENC',
  time: 'CLK',
  security: 'SEC',
  generate: 'GEN',
  code: 'COD',
  text: 'TXT',
}

export interface CategorySection {
  category: ToolCategory
  label: string
  code: string
  count: number
  tools: ToolDefinition[]
}

export interface ToolGroup {
  group: string
  tools: ToolDefinition[]
}

export function getSortedTools(toolList: ToolDefinition[]) {
  return [...toolList].sort((left, right) => {
    const orderDifference = (left.order ?? 999) - (right.order ?? 999)

    return orderDifference === 0
      ? left.title.localeCompare(right.title, 'zh-Hans-CN')
      : orderDifference
  })
}

export function getCategorySections(toolList: ToolDefinition[]): CategorySection[] {
  return categoryOrder
    .map((category) => {
      const tools = getSortedTools(toolList.filter((tool) => tool.category === category))

      return {
        category,
        label: categoryLabels[category],
        code: categoryCodes[category],
        count: tools.length,
        tools,
      }
    })
    .filter((section) => section.count > 0)
}

export function getGroupedToolsByCategory(toolList: ToolDefinition[], category: ToolCategory): ToolGroup[] {
  const tools = getSortedTools(toolList.filter((tool) => tool.category === category))
  const groups = new Map<string, ToolDefinition[]>()

  for (const tool of tools) {
    const group = tool.group ?? '其他'
    groups.set(group, [...(groups.get(group) ?? []), tool])
  }

  return [...groups.entries()].map(([group, groupedTools]) => ({
    group,
    tools: groupedTools,
  }))
}

export function getFeaturedTools(toolList: ToolDefinition[]) {
  return getSortedTools(toolList.filter((tool) => tool.featured))
}

export function searchTools(toolList: ToolDefinition[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return getSortedTools(toolList)
  }

  return getSortedTools(toolList.filter((tool) => {
    const haystack = [
      tool.title,
      tool.description,
      categoryLabels[tool.category],
      tool.group ?? '',
      ...tool.keywords,
      ...(tool.aliases ?? []),
    ].join(' ').toLowerCase()

    return haystack.includes(normalizedQuery)
  }))
}

export function isToolCategory(value: string): value is ToolCategory {
  return categoryOrder.includes(value as ToolCategory)
}
