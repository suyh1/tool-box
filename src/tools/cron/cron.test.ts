import { describe, expect, it } from 'vitest'
import { getNextCronRuns } from './cron'

describe('cron parser', () => {
  it('gets next executions for a simple interval', () => {
    const result = getNextCronRuns('*/15 * * * *', new Date('2026-07-05T10:07:30Z'), 4)

    expect(result).toEqual({
      ok: true,
      value: [
        '2026-07-05 10:15',
        '2026-07-05 10:30',
        '2026-07-05 10:45',
        '2026-07-05 11:00',
      ],
      meta: '已计算 4 次执行时间',
    })
  })

  it('supports ranges and weekday aliases', () => {
    const result = getNextCronRuns('0 9-10 * * MON', new Date('2026-07-05T10:00:00Z'), 3)

    expect(result).toEqual({
      ok: true,
      value: [
        '2026-07-06 09:00',
        '2026-07-06 10:00',
        '2026-07-13 09:00',
      ],
      meta: '已计算 3 次执行时间',
    })
  })

  it('supports month aliases', () => {
    const result = getNextCronRuns('0 0 1 JAN *', new Date('2026-07-05T00:00:00Z'), 2)

    expect(result).toEqual({
      ok: true,
      value: ['2027-01-01 00:00', '2028-01-01 00:00'],
      meta: '已计算 2 次执行时间',
    })
  })

  it('rejects expressions with the wrong number of fields', () => {
    expect(getNextCronRuns('* * * *', new Date('2026-07-05T00:00:00Z'))).toEqual({
      ok: false,
      message: '请输入 5 字段 Cron 表达式。',
    })
  })

  it('rejects out-of-range field values', () => {
    expect(getNextCronRuns('99 * * * *', new Date('2026-07-05T00:00:00Z'))).toMatchObject({
      ok: false,
      message: expect.stringContaining('minute 字段超出范围'),
    })
  })
})
