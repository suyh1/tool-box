export interface RegexMatch {
  value: string
  index: number
  groups: string[]
  namedGroups: Record<string, string>
}

export type RegexResult =
  | { ok: true; matches: RegexMatch[] }
  | { ok: false; message: string }

const VALID_FLAGS = new Set(['d', 'g', 'i', 'm', 's', 'u', 'v', 'y'])

function normalizeFlags(flags: string): string | { message: string } {
  const trimmed = flags.trim()
  const seen = new Set<string>()

  for (const flag of trimmed) {
    if (!VALID_FLAGS.has(flag)) {
      return { message: `不支持的正则标志：${flag}` }
    }

    if (seen.has(flag)) {
      return { message: `正则标志重复：${flag}` }
    }

    seen.add(flag)
  }

  return trimmed.includes('g') ? trimmed : `${trimmed}g`
}

export function testRegex(pattern: string, flags: string, text: string): RegexResult {
  const normalizedFlags = normalizeFlags(flags)

  if (typeof normalizedFlags !== 'string') {
    return { ok: false, message: normalizedFlags.message }
  }

  let regex: RegExp

  try {
    regex = new RegExp(pattern, normalizedFlags)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? `正则表达式无效：${error.message}` : '正则表达式无效',
    }
  }

  const matches: RegexMatch[] = []

  for (const match of text.matchAll(regex)) {
    matches.push({
      value: match[0],
      index: match.index ?? 0,
      groups: match.slice(1).map((group) => group ?? ''),
      namedGroups: Object.fromEntries(
        Object.entries(match.groups ?? {}).map(([key, value]) => [key, value ?? '']),
      ),
    })

    if (match[0] === '') {
      regex.lastIndex += 1
    }
  }

  return { ok: true, matches }
}
