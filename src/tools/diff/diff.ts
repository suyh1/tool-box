export type DiffRowType = 'added' | 'removed' | 'unchanged'

export interface DiffRow {
  type: DiffRowType
  value: string
  oldLineNumber?: number
  newLineNumber?: number
}

export interface DiffSummary {
  added: number
  removed: number
  unchanged: number
}

function splitLines(input: string) {
  return input.length === 0 ? [] : input.replace(/\r\n/g, '\n').split('\n')
}

export function diffLines(oldText: string, newText: string): DiffRow[] {
  const oldLines = splitLines(oldText)
  const newLines = splitLines(newText)
  const table = Array.from({ length: oldLines.length + 1 }, () =>
    Array.from({ length: newLines.length + 1 }, () => 0),
  )

  for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
      table[oldIndex][newIndex] = oldLines[oldIndex] === newLines[newIndex]
        ? table[oldIndex + 1][newIndex + 1] + 1
        : Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1])
    }
  }

  const rows: DiffRow[] = []
  let oldIndex = 0
  let newIndex = 0

  while (oldIndex < oldLines.length && newIndex < newLines.length) {
    if (oldLines[oldIndex] === newLines[newIndex]) {
      rows.push({
        type: 'unchanged',
        value: oldLines[oldIndex],
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
      })
      oldIndex += 1
      newIndex += 1
    } else if (table[oldIndex + 1][newIndex] >= table[oldIndex][newIndex + 1]) {
      rows.push({ type: 'removed', value: oldLines[oldIndex], oldLineNumber: oldIndex + 1 })
      oldIndex += 1
    } else {
      rows.push({ type: 'added', value: newLines[newIndex], newLineNumber: newIndex + 1 })
      newIndex += 1
    }
  }

  while (oldIndex < oldLines.length) {
    rows.push({ type: 'removed', value: oldLines[oldIndex], oldLineNumber: oldIndex + 1 })
    oldIndex += 1
  }

  while (newIndex < newLines.length) {
    rows.push({ type: 'added', value: newLines[newIndex], newLineNumber: newIndex + 1 })
    newIndex += 1
  }

  return rows
}

export function summarizeDiff(rows: DiffRow[]): DiffSummary {
  return rows.reduce<DiffSummary>(
    (summary, row) => ({
      ...summary,
      [row.type]: summary[row.type] + 1,
    }),
    { added: 0, removed: 0, unchanged: 0 },
  )
}
