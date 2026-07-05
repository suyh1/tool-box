export interface CaseConversions {
  camel: string
  pascal: string
  snake: string
  kebab: string
  constant: string
  title: string
}

export function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean)
}

function capitalize(word: string) {
  return word ? `${word.slice(0, 1).toUpperCase()}${word.slice(1)}` : ''
}

export function convertCases(input: string): CaseConversions {
  const words = splitWords(input)
  const pascalWords = words.map(capitalize)

  return {
    camel: words.length === 0 ? '' : `${words[0]}${pascalWords.slice(1).join('')}`,
    pascal: pascalWords.join(''),
    snake: words.join('_'),
    kebab: words.join('-'),
    constant: words.join('_').toUpperCase(),
    title: pascalWords.join(' '),
  }
}
