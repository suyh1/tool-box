import { describe, expect, it } from 'vitest'
import { formatGraphql } from './graphql-format'

describe('formatGraphql', () => {
  it('formats GraphQL queries with readable indentation', () => {
    expect(formatGraphql('query GetUser($id:ID!){user(id:$id){id name posts{title}}}')).toEqual({
      ok: true,
      output: 'query GetUser($id:ID!) {\n  user(id:$id) {\n    id\n    name\n    posts {\n      title\n    }\n  }\n}',
    })
  })

  it('reports unbalanced braces', () => {
    expect(formatGraphql('query { user { id }')).toEqual({
      ok: false,
      message: 'GraphQL 文档括号不平衡。',
    })
  })
})
