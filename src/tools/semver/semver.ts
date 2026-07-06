export interface ParsedSemver {
  version: string
  major: number
  minor: number
  patch: number
  prerelease: string[]
}

export type SemverAnalysisResult =
  | {
      ok: true
      version: string
      range: string
      satisfies: boolean
    }
  | {
      ok: false
      message: string
    }

const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/

function parseSemver(version: string): ParsedSemver {
  const match = version.trim().match(VERSION_PATTERN)

  if (!match) {
    throw new Error(`Invalid SemVer: ${version}`)
  }

  return {
    version: `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}${match[4] ? `-${match[4]}` : ''}`,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split('.') : [],
  }
}

function isNumericIdentifier(value: string): boolean {
  return /^\d+$/.test(value)
}

function compareIdentifiers(left: string, right: string): number {
  const leftNumeric = isNumericIdentifier(left)
  const rightNumeric = isNumericIdentifier(right)

  if (leftNumeric && rightNumeric) {
    return Math.sign(Number(left) - Number(right))
  }

  if (leftNumeric) return -1
  if (rightNumeric) return 1

  return left === right ? 0 : left < right ? -1 : 1
}

function compareParsedSemver(left: ParsedSemver, right: ParsedSemver): number {
  const coreDifference = left.major - right.major || left.minor - right.minor || left.patch - right.patch
  if (coreDifference !== 0) {
    return Math.sign(coreDifference)
  }

  if (left.prerelease.length === 0 && right.prerelease.length === 0) return 0
  if (left.prerelease.length === 0) return 1
  if (right.prerelease.length === 0) return -1

  const length = Math.max(left.prerelease.length, right.prerelease.length)

  for (let index = 0; index < length; index += 1) {
    const leftIdentifier = left.prerelease[index]
    const rightIdentifier = right.prerelease[index]

    if (leftIdentifier === undefined) return -1
    if (rightIdentifier === undefined) return 1

    const difference = compareIdentifiers(leftIdentifier, rightIdentifier)
    if (difference !== 0) {
      return difference
    }
  }

  return 0
}

export function compareSemver(left: string, right: string): number {
  return compareParsedSemver(parseSemver(left), parseSemver(right))
}

function incrementCaretUpperBound(version: ParsedSemver): string {
  if (version.major > 0) {
    return `${version.major + 1}.0.0`
  }

  if (version.minor > 0) {
    return `0.${version.minor + 1}.0`
  }

  return `0.0.${version.patch + 1}`
}

function incrementTildeUpperBound(version: ParsedSemver): string {
  return `${version.major}.${version.minor + 1}.0`
}

function satisfiesComparator(version: string, comparator: string): boolean {
  const match = comparator.match(/^(>=|<=|>|<|=)?(.+)$/)
  if (!match) {
    throw new Error(`Invalid SemVer range comparator: ${comparator}`)
  }

  const operator = match[1] || '='
  const target = match[2].trim()
  const comparison = compareSemver(version, target)

  if (operator === '>') return comparison > 0
  if (operator === '>=') return comparison >= 0
  if (operator === '<') return comparison < 0
  if (operator === '<=') return comparison <= 0

  return comparison === 0
}

function expandRangeToken(token: string): string[] {
  if (token === '*' || token.toLowerCase() === 'x') {
    return []
  }

  if (token.startsWith('^')) {
    const base = parseSemver(token.slice(1))

    return [`>=${base.version}`, `<${incrementCaretUpperBound(base)}`]
  }

  if (token.startsWith('~')) {
    const base = parseSemver(token.slice(1))

    return [`>=${base.version}`, `<${incrementTildeUpperBound(base)}`]
  }

  return [token]
}

export function satisfiesSemverRange(version: string, range: string): boolean {
  parseSemver(version)

  const tokens = range.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0 || tokens.every((token) => token === '*')) {
    return true
  }

  return tokens.flatMap(expandRangeToken).every((comparator) => satisfiesComparator(version, comparator))
}

export function analyzeSemver(version: string, range: string): SemverAnalysisResult {
  try {
    const parsed = parseSemver(version)

    return {
      ok: true,
      version: parsed.version,
      range,
      satisfies: satisfiesSemverRange(version, range),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'SemVer 解析失败。',
    }
  }
}
