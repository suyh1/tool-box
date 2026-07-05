import { describe, expect, it } from 'vitest'
import { convertCases, splitWords } from './case'

describe('case utilities', () => {
  it('splits punctuation, separators, and camel boundaries into words', () => {
    expect(splitWords('helloWorld API_response-id')).toEqual([
      'hello',
      'world',
      'api',
      'response',
      'id',
    ])
  })

  it('converts text to common naming formats', () => {
    expect(convertCases('hello world_api')).toEqual({
      camel: 'helloWorldApi',
      pascal: 'HelloWorldApi',
      snake: 'hello_world_api',
      kebab: 'hello-world-api',
      constant: 'HELLO_WORLD_API',
      title: 'Hello World Api',
    })
  })

  it('returns empty formats for empty input', () => {
    expect(convertCases('   ')).toEqual({
      camel: '',
      pascal: '',
      snake: '',
      kebab: '',
      constant: '',
      title: '',
    })
  })
})
