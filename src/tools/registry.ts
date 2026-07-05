import type { ToolDefinition } from './types'

export const tools: ToolDefinition[] = [
  {
    id: 'json',
    title: 'JSON 格式化',
    description: '在浏览器中安全地格式化、压缩和校验 JSON。',
    path: '/tools/json',
    category: 'format',
    keywords: ['json', 'formatter', 'validator', 'minify'],
    status: 'active',
    component: () => import('./json/JsonTool.vue'),
  },
  {
    id: 'base64',
    title: 'Base64 编解码',
    description: '编码和解码 Base64 文本。',
    path: '/tools/base64',
    category: 'encode',
    keywords: ['base64', 'encode', 'decode'],
    status: 'active',
    component: () => import('./base64/Base64Tool.vue'),
  },
  {
    id: 'url',
    title: 'URL 编解码',
    description: '编码和解码 URL 组件。',
    path: '/tools/url',
    category: 'encode',
    keywords: ['url', 'uri', 'encode', 'decode'],
    status: 'active',
    component: () => import('./url/UrlTool.vue'),
  },
  {
    id: 'timestamp',
    title: '时间戳转换',
    description: '转换 Unix 时间戳和本地日期字符串。',
    path: '/tools/timestamp',
    category: 'time',
    keywords: ['time', 'timestamp', 'unix', 'date'],
    status: 'active',
    component: () => import('./timestamp/TimestampTool.vue'),
  },
  {
    id: 'jwt',
    title: 'JWT 解码',
    description: '本地解码 JWT 标头和载荷，不会上传令牌。',
    path: '/tools/jwt',
    category: 'security',
    keywords: ['jwt', 'token', 'decode', 'header', 'payload'],
    status: 'active',
    component: () => import('./jwt/JwtTool.vue'),
  },
  {
    id: 'hash',
    title: '哈希生成',
    description: '生成浏览器原生 SHA 摘要。',
    path: '/tools/hash',
    category: 'security',
    keywords: ['hash', 'sha', 'digest', 'crypto'],
    status: 'active',
    component: () => import('./hash/HashTool.vue'),
  },
  {
    id: 'uuid',
    title: 'UUID 生成',
    description: '生成随机 UUID 值。',
    path: '/tools/uuid',
    category: 'generate',
    keywords: ['uuid', 'guid', 'random'],
    status: 'active',
    component: () => import('./uuid/UuidTool.vue'),
  },
  {
    id: 'regex',
    title: '正则测试',
    description: '用示例文本测试正则表达式。',
    path: '/tools/regex',
    category: 'text',
    keywords: ['regex', 'regexp', 'pattern', 'match'],
    status: 'active',
    component: () => import('./regex/RegexTool.vue'),
  },
  {
    id: 'diff',
    title: '文本对比',
    description: '在浏览器中对比两段文本。',
    path: '/tools/diff',
    category: 'text',
    keywords: ['diff', 'compare', 'text'],
    status: 'active',
    component: () => import('./diff/DiffTool.vue'),
  },
  {
    id: 'case',
    title: '命名格式转换',
    description: '在常见命名格式之间转换文本。',
    path: '/tools/case',
    category: 'text',
    keywords: ['case', 'camel', 'snake', 'kebab', 'pascal'],
    status: 'active',
    component: () => import('./case/CaseTool.vue'),
  },
]

export function getToolById(toolId: string) {
  return tools.find((tool) => tool.id === toolId)
}

export function getToolByPath(path: string) {
  return tools.find((tool) => tool.path === path)
}
