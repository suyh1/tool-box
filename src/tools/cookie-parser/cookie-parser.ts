export interface CookiePair {
  name: string
  value: string
}

export interface SetCookieResult {
  name: string
  value: string
  attributes: Record<string, string | true>
}

function splitNameValue(part: string): CookiePair {
  const separatorIndex = part.indexOf('=')

  if (separatorIndex === -1) {
    return { name: part.trim(), value: '' }
  }

  return {
    name: part.slice(0, separatorIndex).trim(),
    value: part.slice(separatorIndex + 1).trim(),
  }
}

export function parseCookieHeader(input: string): CookiePair[] {
  return input
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map(splitNameValue)
}

export function parseSetCookieHeader(input: string): SetCookieResult {
  const parts = input.split(';').map((part) => part.trim()).filter(Boolean)
  const cookie = splitNameValue(parts[0] ?? '')
  const attributes: Record<string, string | true> = {}

  for (const part of parts.slice(1)) {
    const attribute = splitNameValue(part)
    attributes[attribute.name.toLowerCase()] = attribute.value === '' ? true : attribute.value
  }

  return {
    ...cookie,
    attributes,
  }
}
