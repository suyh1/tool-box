import { describe, expect, it } from 'vitest'
import { queryJsonPath } from './jsonpath'

describe('jsonpath utilities', () => {
  const input = JSON.stringify({
    store: {
      books: [
        { title: 'Clean Code', price: 30 },
        { title: 'Domain Modeling', price: 42 },
      ],
      'featured-item': { title: 'Refactoring' },
    },
  })

  it('queries dot and bracket properties', () => {
    expect(queryJsonPath(input, '$.store["featured-item"].title').matches).toEqual([
      {
        path: '$.store["featured-item"].title',
        value: 'Refactoring',
      },
    ])
  })

  it('queries array indexes', () => {
    expect(queryJsonPath(input, '$.store.books[1].title').matches).toEqual([
      {
        path: '$.store.books[1].title',
        value: 'Domain Modeling',
      },
    ])
  })

  it('queries wildcard array values', () => {
    expect(queryJsonPath(input, '$.store.books[*].price').matches).toEqual([
      {
        path: '$.store.books[0].price',
        value: 30,
      },
      {
        path: '$.store.books[1].price',
        value: 42,
      },
    ])
  })

  it('returns a concise error for unsupported syntax', () => {
    expect(() => queryJsonPath(input, '$..title')).toThrow('暂不支持递归下降')
  })
})
