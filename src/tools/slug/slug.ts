export interface SlugOptions {
  separator: '-' | '_'
  lowercase: boolean
  maxLength: number
}

function trimSeparators(value: string, separator: string) {
  const escaped = separator === '-' ? '\\-' : separator
  return value.replace(new RegExp(`^${escaped}+|${escaped}+$`, 'g'), '')
}

export function generateSlug(input: string, options: SlugOptions): string {
  const separator = options.separator
  const normalized = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, separator)
    .replace(new RegExp(`${separator}+`, 'g'), separator)

  let slug = trimSeparators(options.lowercase ? normalized.toLowerCase() : normalized, separator)

  if (options.maxLength > 0 && slug.length > options.maxLength) {
    const nextCharacter = slug[options.maxLength]
    slug = trimSeparators(slug.slice(0, options.maxLength), separator)

    if (nextCharacter && nextCharacter !== separator && slug.includes(separator)) {
      slug = slug.slice(0, slug.lastIndexOf(separator))
    }
  }

  return trimSeparators(slug, separator)
}
