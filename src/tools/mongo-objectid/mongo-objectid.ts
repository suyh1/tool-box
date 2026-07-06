export type MongoObjectIdResult =
  | {
      ok: true
      objectId: string
      timestamp: string
      timestampHex: string
      randomValue: string
      counterHex: string
      counter: number
    }
  | {
      ok: false
      message: string
    }

export function parseMongoObjectId(input: string): MongoObjectIdResult {
  const objectId = input.trim().toLowerCase()

  if (!/^[0-9a-f]{24}$/u.test(objectId)) {
    return { ok: false, message: '请输入 24 位十六进制 Mongo ObjectId。' }
  }

  const timestampHex = objectId.slice(0, 8)
  const counterHex = objectId.slice(18, 24)
  const timestampSeconds = Number.parseInt(timestampHex, 16)

  return {
    ok: true,
    objectId,
    timestamp: new Date(timestampSeconds * 1000).toISOString(),
    timestampHex,
    randomValue: objectId.slice(8, 18),
    counterHex,
    counter: Number.parseInt(counterHex, 16),
  }
}
