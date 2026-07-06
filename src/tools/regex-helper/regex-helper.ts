export interface RegexExplanationItem {
  token: string
  description: string
}

export type RegexExplanationResult =
  | {
      ok: true
      items: RegexExplanationItem[]
    }
  | {
      ok: false
      message: string
    }

export type RegexPresetResult =
  | {
      ok: true
      pattern: string
      flags: string
      sample: string
    }
  | {
      ok: false
      message: string
    }

const ESCAPE_DESCRIPTIONS: Record<string, string> = {
  '\\d': '任意数字',
  '\\D': '任意非数字',
  '\\w': '任意字母、数字或下划线',
  '\\W': '任意非单词字符',
  '\\s': '任意空白字符',
  '\\S': '任意非空白字符',
  '\\b': '单词边界',
  '\\n': '换行符',
  '\\t': '制表符',
}

const PRESETS: Record<string, { pattern: string; flags: string; sample: string }> = {
  email: {
    pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',
    flags: 'gi',
    sample: 'admin@example.com',
  },
  url: {
    pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*',
    flags: 'gi',
    sample: 'https://example.com/docs?q=toolbox',
  },
  uuid: {
    pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}',
    flags: 'gi',
    sample: '550e8400-e29b-41d4-a716-446655440000',
  },
  ipv4: {
    pattern: '(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)){3}',
    flags: 'g',
    sample: '192.168.1.10',
  },
}

function describeQuantifier(token: string) {
  const body = token.slice(1, -1)
  const [min, max] = body.split(',')

  if (max === undefined) {
    return `重复 ${min} 次`
  }

  if (max === '') {
    return `至少重复 ${min} 次`
  }

  return `重复 ${min} 到 ${max} 次`
}

export function explainRegex(pattern: string): RegexExplanationResult {
  try {
    new RegExp(pattern)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `正则表达式无效：${error.message}` : '正则表达式无效',
    }
  }

  const items: RegexExplanationItem[] = []

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index]
    const next = pattern[index + 1]

    if (character === '^') {
      items.push({ token: '^', description: '匹配文本开头' })
      continue
    }

    if (character === '$') {
      items.push({ token: '$', description: '匹配文本结尾' })
      continue
    }

    if (character === '[') {
      const end = pattern.indexOf(']', index + 1)
      if (end !== -1) {
        const token = pattern.slice(index, end + 1)
        items.push({ token, description: `字符集：${token.slice(1, -1)}` })
        index = end
      }
      continue
    }

    if (character === '(' && pattern.startsWith('(?<', index)) {
      const end = pattern.indexOf('>', index + 3)
      if (end !== -1) {
        const name = pattern.slice(index + 3, end)
        items.push({ token: pattern.slice(index, end + 1), description: `开始名为 ${name} 的捕获组` })
        index = end
      }
      continue
    }

    if (character === '(') {
      if (pattern.startsWith('(?:', index)) {
        items.push({ token: '(?:', description: '开始非捕获组' })
        index += 2
      } else {
        items.push({ token: '(', description: '开始捕获组' })
      }
      continue
    }

    if (character === ')') {
      items.push({ token: ')', description: '结束分组' })
      continue
    }

    if (character === '\\' && next) {
      const token = `${character}${next}`
      items.push({ token, description: ESCAPE_DESCRIPTIONS[token] ?? `转义字符 ${next}` })
      index += 1
      continue
    }

    if (character === '{') {
      const end = pattern.indexOf('}', index + 1)
      if (end !== -1) {
        const token = pattern.slice(index, end + 1)
        items.push({ token, description: describeQuantifier(token) })
        index = end
      }
      continue
    }

    if (character === '+') {
      items.push({ token: '+', description: '重复 1 次或更多次' })
      continue
    }

    if (character === '*') {
      items.push({ token: '*', description: '重复 0 次或更多次' })
      continue
    }

    if (character === '?') {
      items.push({ token: '?', description: '重复 0 次或 1 次' })
      continue
    }

    if (character === '|') {
      items.push({ token: '|', description: '匹配左侧或右侧表达式' })
    }
  }

  return { ok: true, items }
}

export function buildRegexFromPreset(preset: string): RegexPresetResult {
  const normalized = preset.trim().toLowerCase()
  const result = PRESETS[normalized]

  if (!result) {
    return { ok: false, message: `未知正则预设：${preset}` }
  }

  return { ok: true, ...result }
}
