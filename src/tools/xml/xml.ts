export type XmlValidationResult =
  | { ok: true }
  | { ok: false; message: string }

export function validateXml(input: string): XmlValidationResult {
  try {
    const document = new DOMParser().parseFromString(input, 'application/xml')
    const parserError = document.querySelector('parsererror')

    if (parserError) {
      return {
        ok: false,
        message: `XML 无效：${parserError.textContent?.trim() || '解析失败'}`,
      }
    }

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : '解析失败'

    return {
      ok: false,
      message: `XML 无效：${message}`,
    }
  }
}

function assertValidXml(input: string) {
  const result = validateXml(input)

  if (!result.ok) {
    throw new Error(result.message)
  }
}

function tokenizeXml(input: string) {
  return input
    .replace(/>\s+</g, '><')
    .replace(/(<[^>]+>)/g, '\n$1\n')
    .split('\n')
    .map((token) => token.trim())
    .filter(Boolean)
}

export function formatXml(input: string) {
  assertValidXml(input)

  let depth = 0
  const lines: string[] = []

  for (const token of tokenizeXml(input)) {
    const isClosingTag = /^<\//.test(token)
    const isDeclaration = /^<\?/.test(token)
    const isComment = /^<!--/.test(token)
    const isSelfClosingTag = /\/>$/.test(token)
    const isOpeningTag = /^<[^!?/][^>]*>$/.test(token)

    if (isClosingTag) {
      depth = Math.max(0, depth - 1)
    }

    lines.push(`${'  '.repeat(depth)}${token}`)

    if (isOpeningTag && !isSelfClosingTag && !isDeclaration && !isComment) {
      depth += 1
    }
  }

  return lines.join('\n')
}

export function minifyXml(input: string) {
  assertValidXml(input)

  return input
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
