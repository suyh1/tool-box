import { describe, expect, it } from 'vitest'
import { convertJsonToType } from './json-type'

describe('json type converter', () => {
  it('generates TypeScript interfaces with nested objects, optional fields, and nullable values', () => {
    const result = convertJsonToType(JSON.stringify([
      {
        id: 1,
        name: 'Ada',
        email: 'ada@example.com',
        tags: ['admin'],
        profile: {
          avatar_url: 'https://example.com/a.png',
          score: 98.5,
        },
      },
      {
        id: 2,
        name: 'Lin',
        email: null,
        tags: [],
      },
    ]), 'typescript', 'user')

    expect(result.ok).toBe(true)
    expect(result).toMatchObject({ ok: true, meta: 'TypeScript interface 已生成' })

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('export interface User {')
    expect(result.value).toContain('id: number')
    expect(result.value).toContain('name: string')
    expect(result.value).toContain('email: string | null')
    expect(result.value).toContain('tags: string[]')
    expect(result.value).toContain('profile?: UserProfile')
    expect(result.value).toContain('export interface UserProfile {')
    expect(result.value).toContain('avatar_url: string')
    expect(result.value).toContain('score: number')
  })

  it('generates Java classes with nested list item classes', () => {
    const result = convertJsonToType(JSON.stringify({
      order_id: 'A-100',
      total: 42.5,
      items: [
        { sku: 'book', quantity: 2 },
      ],
    }), 'java', 'order')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('import java.util.List;')
    expect(result.value).toContain('public class Order {')
    expect(result.value).toContain('private String orderId;')
    expect(result.value).toContain('private Double total;')
    expect(result.value).toContain('private List<OrderItem> items;')
    expect(result.value).toContain('public static class OrderItem {')
    expect(result.value).toContain('private String sku;')
    expect(result.value).toContain('private Double quantity;')
  })

  it('generates Go structs with exported fields and json tags', () => {
    const result = convertJsonToType(JSON.stringify({
      request_id: 'abc',
      is_admin: false,
      retry_count: 3,
    }), 'go', 'api response')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain('type ApiResponse struct {')
    expect(result.value).toContain('RequestId string `json:"request_id"`')
    expect(result.value).toContain('IsAdmin bool `json:"is_admin"`')
    expect(result.value).toContain('RetryCount float64 `json:"retry_count"`')
  })

  it('generates Zod schemas with optional and nullable fields', () => {
    const result = convertJsonToType(JSON.stringify([
      { name: 'Ada', email: 'ada@example.com', roles: ['admin'] },
      { name: 'Lin', email: null },
    ]), 'zod', 'person')

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.value).toContain("import { z } from 'zod'")
    expect(result.value).toContain('export const PersonSchema = z.object({')
    expect(result.value).toContain('name: z.string()')
    expect(result.value).toContain('email: z.string().nullable()')
    expect(result.value).toContain('roles: z.array(z.string()).optional()')
  })

  it('quotes invalid TypeScript and Zod object keys', () => {
    const input = JSON.stringify({
      'user-id': 1,
      'display name': 'Ada',
    })
    const typescript = convertJsonToType(input, 'typescript')
    const zod = convertJsonToType(input, 'zod')

    expect(typescript).toMatchObject({ ok: true })
    expect(zod).toMatchObject({ ok: true })

    if (!typescript.ok || !zod.ok) {
      return
    }

    expect(typescript.value).toContain('"user-id": number')
    expect(typescript.value).toContain('"display name": string')
    expect(zod.value).toContain('"user-id": z.number()')
    expect(zod.value).toContain('"display name": z.string()')
  })

  it('returns a readable error for invalid JSON', () => {
    expect(convertJsonToType('{', 'typescript')).toMatchObject({
      ok: false,
      message: expect.stringContaining('JSON 无效'),
    })
  })

  it('rejects unsupported root values', () => {
    expect(convertJsonToType('"hello"', 'typescript')).toEqual({
      ok: false,
      message: '请提供 JSON 对象或对象数组。',
    })
  })
})
