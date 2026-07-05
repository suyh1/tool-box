export type CronResult =
  | {
      ok: true
      value: string[]
      meta: string
    }
  | {
      ok: false
      message: string
    }

interface ParsedCron {
  minute: Set<number>
  hour: Set<number>
  dayOfMonth: Set<number>
  month: Set<number>
  dayOfWeek: Set<number>
  dayOfMonthAny: boolean
  dayOfWeekAny: boolean
}

const monthAliases: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
}

const weekdayAliases: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}

function numberRange(min: number, max: number) {
  const values: number[] = []

  for (let value = min; value <= max; value += 1) {
    values.push(value)
  }

  return values
}

function resolveValue(raw: string, aliases: Record<string, number>, field: string, min: number, max: number): number {
  const upper = raw.toUpperCase()
  const value = aliases[upper] ?? Number(raw)

  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} 字段超出范围：${raw}`)
  }

  return value === 7 && field === 'day-of-week' ? 0 : value
}

function parseField(
  expression: string,
  field: string,
  min: number,
  max: number,
  aliases: Record<string, number> = {},
) {
  const values = new Set<number>()
  const any = expression === '*'

  for (const part of expression.split(',')) {
    if (!part) {
      throw new Error(`${field} 字段包含空片段`)
    }

    const [rangeExpression, stepExpression] = part.split('/')
    const step = stepExpression === undefined ? 1 : Number(stepExpression)

    if (!Number.isInteger(step) || step <= 0) {
      throw new Error(`${field} 字段步长无效：${part}`)
    }

    let rangeValues: number[]

    if (rangeExpression === '*') {
      rangeValues = numberRange(min, max)
    } else if (rangeExpression.includes('-')) {
      const [startRaw, endRaw] = rangeExpression.split('-')
      const start = resolveValue(startRaw, aliases, field, min, max)
      const end = resolveValue(endRaw, aliases, field, min, max)

      if (start > end) {
        throw new Error(`${field} 字段范围无效：${part}`)
      }

      rangeValues = numberRange(start, end)
    } else {
      rangeValues = [resolveValue(rangeExpression, aliases, field, min, max)]
    }

    rangeValues
      .filter((_, index) => index % step === 0)
      .forEach((value) => values.add(value))
  }

  return { values, any }
}

function parseCron(expression: string): ParsedCron {
  const fields = expression.trim().split(/\s+/)

  if (fields.length !== 5) {
    throw new Error('请输入 5 字段 Cron 表达式。')
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields
  const parsedDayOfMonth = parseField(dayOfMonth, 'day-of-month', 1, 31)
  const parsedDayOfWeek = parseField(dayOfWeek, 'day-of-week', 0, 7, weekdayAliases)

  return {
    minute: parseField(minute, 'minute', 0, 59).values,
    hour: parseField(hour, 'hour', 0, 23).values,
    dayOfMonth: parsedDayOfMonth.values,
    month: parseField(month, 'month', 1, 12, monthAliases).values,
    dayOfWeek: parsedDayOfWeek.values,
    dayOfMonthAny: parsedDayOfMonth.any,
    dayOfWeekAny: parsedDayOfWeek.any,
  }
}

function matchesDay(parsed: ParsedCron, date: Date) {
  const dayOfMonthMatch = parsed.dayOfMonth.has(date.getUTCDate())
  const dayOfWeekMatch = parsed.dayOfWeek.has(date.getUTCDay())

  if (parsed.dayOfMonthAny && parsed.dayOfWeekAny) {
    return true
  }

  if (parsed.dayOfMonthAny) {
    return dayOfWeekMatch
  }

  if (parsed.dayOfWeekAny) {
    return dayOfMonthMatch
  }

  return dayOfMonthMatch || dayOfWeekMatch
}

function matches(parsed: ParsedCron, date: Date) {
  return parsed.minute.has(date.getUTCMinutes())
    && parsed.hour.has(date.getUTCHours())
    && parsed.month.has(date.getUTCMonth() + 1)
    && matchesDay(parsed, date)
}

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`,
  ].join(' ')
}

export function getNextCronRuns(expression: string, from = new Date(), count = 5): CronResult {
  let parsed: ParsedCron

  try {
    parsed = parseCron(expression)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Cron 表达式无效',
    }
  }

  const runs: string[] = []
  const cursor = new Date(from)

  cursor.setUTCSeconds(0, 0)
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1)

  const maxIterations = 60 * 24 * 366 * 5

  for (let index = 0; index < maxIterations && runs.length < count; index += 1) {
    if (matches(parsed, cursor)) {
      runs.push(formatDate(cursor))
    }

    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1)
  }

  if (runs.length === 0) {
    return {
      ok: false,
      message: '未来 5 年内没有找到执行时间。',
    }
  }

  return {
    ok: true,
    value: runs,
    meta: `已计算 ${runs.length} 次执行时间`,
  }
}
