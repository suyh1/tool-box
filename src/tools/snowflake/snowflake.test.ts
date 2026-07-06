import { describe, expect, it } from 'vitest'
import { generateSnowflakeId, parseSnowflakeId } from './snowflake'

describe('snowflake utilities', () => {
  it('parses Snowflake IDs into timestamp, worker, and sequence fields', () => {
    expect(parseSnowflakeId('4194304', { epochMs: 0 })).toEqual({
      ok: true,
      id: '4194304',
      timestampMs: 1,
      dateTime: '1970-01-01T00:00:00.001Z',
      workerId: 0,
      sequence: 0,
      epochMs: 0,
    })
  })

  it('generates Snowflake IDs that can be parsed back', () => {
    const generated = generateSnowflakeId({
      timestampMs: Date.UTC(2026, 6, 6, 0, 0, 0),
      workerId: 42,
      sequence: 7,
    })

    if (!generated.ok) {
      throw new Error(generated.message)
    }

    expect(parseSnowflakeId(generated.id)).toMatchObject({
      ok: true,
      timestampMs: Date.UTC(2026, 6, 6, 0, 0, 0),
      workerId: 42,
      sequence: 7,
    })
  })

  it('returns readable errors for invalid Snowflake values', () => {
    expect(parseSnowflakeId('abc')).toEqual({
      ok: false,
      message: 'Snowflake ID 必须是非负整数。',
    })
  })
})
