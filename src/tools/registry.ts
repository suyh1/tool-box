import type { ToolDefinition } from './types'

const comingSoon = () => import('./_shared/ComingSoonTool.vue')

export const tools: ToolDefinition[] = [
  {
    id: 'json',
    title: 'JSON Formatter',
    description: 'Format, minify, and validate JSON safely in the browser.',
    path: '/tools/json',
    category: 'format',
    keywords: ['json', 'formatter', 'validator', 'minify'],
    status: 'active',
    component: () => import('./json/JsonTool.vue'),
  },
  {
    id: 'base64',
    title: 'Base64',
    description: 'Encode and decode Base64 text.',
    path: '/tools/base64',
    category: 'encode',
    keywords: ['base64', 'encode', 'decode'],
    status: 'active',
    component: () => import('./base64/Base64Tool.vue'),
  },
  {
    id: 'url',
    title: 'URL Codec',
    description: 'Encode and decode URL components.',
    path: '/tools/url',
    category: 'encode',
    keywords: ['url', 'uri', 'encode', 'decode'],
    status: 'active',
    component: () => import('./url/UrlTool.vue'),
  },
  {
    id: 'timestamp',
    title: 'Timestamp Converter',
    description: 'Convert Unix timestamps and local date strings.',
    path: '/tools/timestamp',
    category: 'time',
    keywords: ['time', 'timestamp', 'unix', 'date'],
    status: 'active',
    component: () => import('./timestamp/TimestampTool.vue'),
  },
  {
    id: 'jwt',
    title: 'JWT Decoder',
    description: 'Decode JWT headers and payloads without sending tokens anywhere.',
    path: '/tools/jwt',
    category: 'security',
    keywords: ['jwt', 'token', 'decode', 'header', 'payload'],
    status: 'active',
    component: () => import('./jwt/JwtTool.vue'),
  },
  {
    id: 'hash',
    title: 'Hash Generator',
    description: 'Generate browser-native SHA digests.',
    path: '/tools/hash',
    category: 'security',
    keywords: ['hash', 'sha', 'digest', 'crypto'],
    status: 'active',
    component: () => import('./hash/HashTool.vue'),
  },
  {
    id: 'uuid',
    title: 'UUID Generator',
    description: 'Generate random UUID values.',
    path: '/tools/uuid',
    category: 'generate',
    keywords: ['uuid', 'guid', 'random'],
    status: 'active',
    component: () => import('./uuid/UuidTool.vue'),
  },
  {
    id: 'regex',
    title: 'Regex Tester',
    description: 'Test regular expressions against sample text.',
    path: '/tools/regex',
    category: 'text',
    keywords: ['regex', 'regexp', 'pattern', 'match'],
    status: 'planned',
    component: comingSoon,
  },
  {
    id: 'diff',
    title: 'Text Diff',
    description: 'Compare two text snippets in the browser.',
    path: '/tools/diff',
    category: 'text',
    keywords: ['diff', 'compare', 'text'],
    status: 'planned',
    component: comingSoon,
  },
  {
    id: 'case',
    title: 'Case Converter',
    description: 'Convert text between common naming cases.',
    path: '/tools/case',
    category: 'text',
    keywords: ['case', 'camel', 'snake', 'kebab', 'pascal'],
    status: 'planned',
    component: comingSoon,
  },
]

export function getToolById(toolId: string) {
  return tools.find((tool) => tool.id === toolId)
}

export function getToolByPath(path: string) {
  return tools.find((tool) => tool.path === path)
}
