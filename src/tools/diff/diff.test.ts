import { describe, expect, it } from 'vitest'
import { diffLines, summarizeDiff } from './diff'

describe('diff utilities', () => {
  it('marks unchanged, removed, and added lines', () => {
    expect(diffLines('a\nb\nc', 'a\nx\nc')).toEqual([
      { type: 'unchanged', value: 'a', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'removed', value: 'b', oldLineNumber: 2 },
      { type: 'added', value: 'x', newLineNumber: 2 },
      { type: 'unchanged', value: 'c', oldLineNumber: 3, newLineNumber: 3 },
    ])
  })

  it('summarizes diff rows', () => {
    expect(summarizeDiff(diffLines('a\nb', 'a\nb\nc'))).toEqual({
      added: 1,
      removed: 0,
      unchanged: 2,
    })
  })

  it('handles empty input', () => {
    expect(diffLines('', '')).toEqual([])
  })

  it('handles repeated lines predictably', () => {
    expect(diffLines('a\nb\na', 'b\na')).toEqual([
      { type: 'removed', value: 'a', oldLineNumber: 1 },
      { type: 'unchanged', value: 'b', oldLineNumber: 2, newLineNumber: 1 },
      { type: 'unchanged', value: 'a', oldLineNumber: 3, newLineNumber: 2 },
    ])
  })
})
