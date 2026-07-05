import { describe, expect, it } from 'vitest'
import { convertCurlToCode, parseCurlCommand, tokenizeCurl } from './curl'

describe('curl converter', () => {
  it('tokenizes quoted curl commands', () => {
    expect(tokenizeCurl("curl -H 'Accept: application/json' https://api.example.com")).toEqual([
      'curl',
      '-H',
      'Accept: application/json',
      'https://api.example.com',
    ])
  })

  it('parses method, headers, body, and url', () => {
    expect(parseCurlCommand("curl -X POST -H 'Content-Type: application/json' -d '{\"name\":\"Ada\"}' https://api.example.com/users")).toEqual({
      ok: true,
      value: {
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"name":"Ada"}',
        auth: null,
      },
    })
  })

  it('generates fetch code', () => {
    const result = convertCurlToCode("curl -H 'Accept: application/json' https://api.example.com/users", 'fetch')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain("fetch('https://api.example.com/users'")
    expect(result.value).toContain("'Accept': 'application/json'")
  })

  it('generates axios code with auth', () => {
    const result = convertCurlToCode("curl -u ada:secret -d 'name=Ada' https://api.example.com/users", 'axios')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain("axios.post('https://api.example.com/users'")
    expect(result.value).toContain("auth: { username: 'ada', password: 'secret' }")
  })

  it('generates Python requests code', () => {
    const result = convertCurlToCode("curl -X DELETE https://api.example.com/users/1", 'python')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain("requests.delete('https://api.example.com/users/1')")
  })

  it('returns an error when URL is missing', () => {
    expect(convertCurlToCode("curl -H 'Accept: application/json'", 'fetch')).toEqual({
      ok: false,
      message: '没有找到请求 URL。',
    })
  })
})
