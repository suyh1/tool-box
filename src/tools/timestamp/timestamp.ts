export type TimestampResult = {
  ok: true
  iso: string
  milliseconds: number
  seconds: number
} | {
  ok: false
  message: string
}

function resultFromMilliseconds(milliseconds: number): TimestampResult {
  if (!Number.isFinite(milliseconds)) {
    return {
      ok: false,
      message: 'Invalid timestamp',
    }
  }

  const date = new Date(milliseconds)

  if (Number.isNaN(date.getTime())) {
    return {
      ok: false,
      message: 'Invalid timestamp',
    }
  }

  return {
    ok: true,
    iso: date.toISOString(),
    milliseconds,
    seconds: Math.trunc(milliseconds / 1000),
  }
}

export function unixToIso(input: string, unit: 'seconds' | 'milliseconds'): TimestampResult {
  const normalized = input.trim()
  const value = Number(normalized)

  if (!normalized || !Number.isFinite(value)) {
    return {
      ok: false,
      message: 'Enter a Unix timestamp',
    }
  }

  const milliseconds = unit === 'seconds' ? value * 1000 : value
  return resultFromMilliseconds(milliseconds)
}

export function dateToUnix(input: string): TimestampResult {
  const milliseconds = Date.parse(input)

  if (Number.isNaN(milliseconds)) {
    return {
      ok: false,
      message: 'Enter a valid date string',
    }
  }

  return resultFromMilliseconds(milliseconds)
}
