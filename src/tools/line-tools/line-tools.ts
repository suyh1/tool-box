export type LineSortMode = 'none' | 'asc' | 'desc'

export interface LineProcessOptions {
  trimLines: boolean
  removeEmpty: boolean
  sort: LineSortMode
  unique: boolean
  caseSensitive: boolean
}

export interface LineProcessResult {
  output: string
  stats: {
    inputLines: number
    outputLines: number
    removedEmpty: number
    removedDuplicates: number
  }
}

function lineKey(line: string, caseSensitive: boolean) {
  return caseSensitive ? line : line.toLocaleLowerCase()
}

export function processLines(input: string, options: LineProcessOptions): LineProcessResult {
  const inputLines = input.length === 0 ? [] : input.split(/\r\n|\r|\n/)
  let lines = options.trimLines ? inputLines.map((line) => line.trim()) : [...inputLines]
  const beforeEmpty = lines.length

  if (options.removeEmpty) {
    lines = lines.filter((line) => line.length > 0)
  }

  const afterEmpty = lines.length
  const beforeUnique = lines.length

  if (options.unique) {
    const seen = new Set<string>()
    lines = lines.filter((line) => {
      const key = lineKey(line, options.caseSensitive)
      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
  }

  if (options.sort !== 'none') {
    lines = [...lines].sort((left, right) => {
      const leftKey = lineKey(left, options.caseSensitive)
      const rightKey = lineKey(right, options.caseSensitive)
      return options.sort === 'asc'
        ? leftKey.localeCompare(rightKey)
        : rightKey.localeCompare(leftKey)
    })
  }

  return {
    output: lines.join('\n'),
    stats: {
      inputLines: inputLines.length,
      outputLines: lines.length,
      removedEmpty: beforeEmpty - afterEmpty,
      removedDuplicates: beforeUnique - lines.length,
    },
  }
}
