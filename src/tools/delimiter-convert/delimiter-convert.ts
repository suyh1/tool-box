export type DelimiterKind = 'newline' | 'comma' | 'tab' | 'space' | 'custom'

export interface DelimiterConvertOptions {
  from: DelimiterKind
  to: DelimiterKind
  customFrom?: string
  customTo?: string
  trimItems: boolean
  removeEmpty: boolean
}

export interface DelimiterConvertResult {
  output: string
  items: string[]
  stats: {
    inputItems: number
    outputItems: number
    removedEmpty: number
  }
}

function splitPattern(kind: DelimiterKind, custom?: string): string | RegExp {
  if (kind === 'newline') {
    return /\r\n|\r|\n/
  }

  if (kind === 'comma') {
    return /,/
  }

  if (kind === 'tab') {
    return /\t/
  }

  if (kind === 'space') {
    return /\s+/
  }

  return custom ?? ''
}

function joinDelimiter(kind: DelimiterKind, custom?: string) {
  if (kind === 'newline') {
    return '\n'
  }

  if (kind === 'comma') {
    return ', '
  }

  if (kind === 'tab') {
    return '\t'
  }

  if (kind === 'space') {
    return ' '
  }

  return custom ?? ''
}

export function convertDelimiter(input: string, options: DelimiterConvertOptions): DelimiterConvertResult {
  const separator = splitPattern(options.from, options.customFrom)
  const rawItems = input.length === 0
    ? []
    : separator === ''
      ? [input]
      : input.split(separator)
  const trimmedItems = options.trimItems ? rawItems.map((item) => item.trim()) : rawItems
  const items = options.removeEmpty ? trimmedItems.filter((item) => item.length > 0) : trimmedItems

  return {
    output: items.join(joinDelimiter(options.to, options.customTo)),
    items,
    stats: {
      inputItems: rawItems.length,
      outputItems: items.length,
      removedEmpty: trimmedItems.length - items.length,
    },
  }
}
