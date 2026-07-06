export type MockJsonMode = 'schema' | 'sample'

export interface GenerateMockJsonOptions {
  mode?: MockJsonMode
}

export type GenerateMockJsonResult =
  | {
      ok: true
      json: string
      mode: MockJsonMode
    }
  | {
      ok: false
      message: string
    }

const sampleWords = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot']
let sequence = 0

function nextWord() {
  const word = sampleWords[sequence % sampleWords.length]
  sequence += 1
  return word
}

function mockFromToken(token: string): unknown {
  switch (token.toLowerCase()) {
    case 'uuid':
    case 'id':
      return crypto.randomUUID()
    case 'name':
      return 'Ada Lovelace'
    case 'email':
      return 'ada@example.com'
    case 'date':
      return '2026-07-06T00:00:00.000Z'
    case 'word':
    case 'string':
      return nextWord()
    case 'number':
      return 42
    case 'integer':
      return 7
    case 'boolean':
      return true
    case 'null':
      return null
    default:
      return token
  }
}

function mockFromSchema(value: unknown): unknown {
  if (typeof value === 'string') {
    return mockFromToken(value)
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? [mockFromSchema(value[0])] : []
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mockFromSchema(item)]))
  }

  return value
}

function mockFromSample(value: unknown): unknown {
  if (typeof value === 'string') {
    return 'sample text'
  }

  if (typeof value === 'number') {
    return 42
  }

  if (typeof value === 'boolean') {
    return !value
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? [mockFromSample(value[0])] : []
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mockFromSample(item)]))
  }

  return value
}

export function generateMockJson(input: string, options: GenerateMockJsonOptions = {}): GenerateMockJsonResult {
  const mode = options.mode ?? 'schema'

  try {
    const parsed = JSON.parse(input)
    const value = mode === 'sample' ? mockFromSample(parsed) : mockFromSchema(parsed)

    return {
      ok: true,
      json: JSON.stringify(value, null, 2),
      mode,
    }
  } catch (error) {
    return {
      ok: false,
      message: `JSON 无效：${error instanceof Error ? error.message : '解析失败'}`,
    }
  }
}
