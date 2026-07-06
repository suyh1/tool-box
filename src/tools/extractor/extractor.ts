export interface ExtractedEntities {
  urls: string[]
  emails: string[]
  ipv4: string[]
  ipv6: string[]
  total: number
}

function uniqueMatches(input: string, pattern: RegExp, clean = (value: string) => value) {
  const seen = new Set<string>()
  const values: string[] = []

  for (const match of input.matchAll(pattern)) {
    const value = clean(match[0])
    if (value && !seen.has(value)) {
      seen.add(value)
      values.push(value)
    }
  }

  return values
}

function trimTrailingPunctuation(value: string) {
  return value.replace(/[),.;:!?]+$/u, '')
}

function isValidIpv6Candidate(value: string) {
  if (!value.includes(':')) {
    return false
  }

  if ((value.match(/::/g) ?? []).length > 1) {
    return false
  }

  const parts = value.split(':')
  const filledParts = parts.filter((part) => part.length > 0)

  if (filledParts.length < 2 || filledParts.length > 8) {
    return false
  }

  return filledParts.every((part) => /^[0-9a-f]{1,4}$/iu.test(part))
}

export function extractEntities(input: string): ExtractedEntities {
  const urls = uniqueMatches(input, /\bhttps?:\/\/[^\s<>"']+/giu, trimTrailingPunctuation)
  const emails = uniqueMatches(input, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu)
  const ipv4 = uniqueMatches(
    input,
    /\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/gu,
  )
  const ipv6 = uniqueMatches(input, /[0-9a-f:]*:[0-9a-f:]+/giu, trimTrailingPunctuation)
    .filter(isValidIpv6Candidate)

  return {
    urls,
    emails,
    ipv4,
    ipv6,
    total: urls.length + emails.length + ipv4.length + ipv6.length,
  }
}
