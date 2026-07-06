export interface HtmlEntityEncodeOptions {
  encodeNonAscii?: boolean
}

export type HtmlEntityDecodeResult =
  | {
      ok: true
      value: string
    }
  | {
      ok: false
      message: string
    }

const namedEntityByCharacter: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
  '\u00A0': '&nbsp;',
}

const characterByNamedEntity: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
}

export function encodeHtmlEntities(input: string, options: HtmlEntityEncodeOptions = {}) {
  return [...input].map((character) => {
    const named = namedEntityByCharacter[character]

    if (named) {
      return named
    }

    const codePoint = character.codePointAt(0) ?? 0

    return options.encodeNonAscii && codePoint > 0x7f
      ? `&#x${codePoint.toString(16).toUpperCase()};`
      : character
  }).join('')
}

function decodeNumericEntity(entity: string, value: string, radix: 10 | 16): HtmlEntityDecodeResult {
  const codePoint = Number.parseInt(value, radix)

  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
    return {
      ok: false,
      message: `无效的 HTML 数字实体：${entity}`,
    }
  }

  try {
    return {
      ok: true,
      value: String.fromCodePoint(codePoint),
    }
  } catch {
    return {
      ok: false,
      message: `无效的 HTML 数字实体：${entity}`,
    }
  }
}

export function decodeHtmlEntities(input: string): HtmlEntityDecodeResult {
  let output = ''
  let lastIndex = 0
  const entityPattern = /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]+);/g

  for (const match of input.matchAll(entityPattern)) {
    const entity = match[0]
    const body = match[1]
    const index = match.index ?? 0

    output += input.slice(lastIndex, index)

    if (body.startsWith('#x')) {
      const decoded = decodeNumericEntity(entity, body.slice(2), 16)

      if (!decoded.ok) {
        return decoded
      }

      output += decoded.value
    } else if (body.startsWith('#')) {
      const decoded = decodeNumericEntity(entity, body.slice(1), 10)

      if (!decoded.ok) {
        return decoded
      }

      output += decoded.value
    } else {
      output += characterByNamedEntity[body] ?? entity
    }

    lastIndex = index + entity.length
  }

  return {
    ok: true,
    value: output + input.slice(lastIndex),
  }
}
