export interface SnowflakeOptions {
  epochMs?: number
}

export interface GenerateSnowflakeOptions extends SnowflakeOptions {
  timestampMs?: number
  workerId?: number
  sequence?: number
}

export type SnowflakeResult =
  | {
      ok: true
      id: string
      timestampMs: number
      dateTime: string
      workerId: number
      sequence: number
      epochMs: number
    }
  | {
      ok: false
      message: string
    }

export const defaultSnowflakeEpochMs = 1288834974657

function isSafeIntegerInRange(value: number, min: number, max: number) {
  return Number.isSafeInteger(value) && value >= min && value <= max
}

function toSnowflakeResult(id: bigint, epochMs: number): SnowflakeResult {
  const timestampOffset = id >> 22n
  const timestampMs = Number(timestampOffset) + epochMs
  const workerId = Number((id >> 12n) & 0x3ffn)
  const sequence = Number(id & 0xfffn)

  return {
    ok: true,
    id: id.toString(),
    timestampMs,
    dateTime: new Date(timestampMs).toISOString(),
    workerId,
    sequence,
    epochMs,
  }
}

export function parseSnowflakeId(input: string, options: SnowflakeOptions = {}): SnowflakeResult {
  const normalized = input.trim()

  if (!/^\d+$/.test(normalized)) {
    return {
      ok: false,
      message: 'Snowflake ID 必须是非负整数。',
    }
  }

  return toSnowflakeResult(BigInt(normalized), options.epochMs ?? defaultSnowflakeEpochMs)
}

export function generateSnowflakeId(options: GenerateSnowflakeOptions = {}): SnowflakeResult {
  const epochMs = options.epochMs ?? defaultSnowflakeEpochMs
  const timestampMs = options.timestampMs ?? Date.now()
  const workerId = options.workerId ?? 1
  const sequence = options.sequence ?? 0

  if (!isSafeIntegerInRange(timestampMs, epochMs, Number.MAX_SAFE_INTEGER)) {
    return {
      ok: false,
      message: '时间戳必须是不早于 epoch 的安全整数毫秒。',
    }
  }

  if (!isSafeIntegerInRange(workerId, 0, 1023)) {
    return {
      ok: false,
      message: 'Worker ID 必须是 0 到 1023 的整数。',
    }
  }

  if (!isSafeIntegerInRange(sequence, 0, 4095)) {
    return {
      ok: false,
      message: '序列号必须是 0 到 4095 的整数。',
    }
  }

  const id = (BigInt(timestampMs - epochMs) << 22n) | (BigInt(workerId) << 12n) | BigInt(sequence)
  return toSnowflakeResult(id, epochMs)
}
