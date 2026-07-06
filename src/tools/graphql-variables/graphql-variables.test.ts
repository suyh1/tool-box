import { describe, expect, it } from 'vitest'
import { checkGraphqlVariables } from './graphql-variables'

describe('checkGraphqlVariables', () => {
  it('reports missing required variables and unused provided variables', () => {
    const result = checkGraphqlVariables(
      'query GetUser($id: ID!, $limit: Int) { user(id: $id) { posts(limit: $limit) { title } } }',
      '{"limit":10,"extra":true}',
    )

    expect(result).toEqual({
      ok: true,
      defined: ['id', 'limit'],
      provided: ['limit', 'extra'],
      missingRequired: ['id'],
      unusedProvided: ['extra'],
      invalidJson: '',
    })
  })
})
