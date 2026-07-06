import bcrypt from 'bcryptjs'

export type BcryptHashResult =
  | {
      ok: true
      hash: string
      rounds: number
      truncates: boolean
    }
  | {
      ok: false
      message: string
    }

export type BcryptVerifyResult =
  | {
      ok: true
      verified: boolean
    }
  | {
      ok: false
      message: string
    }

function validateRounds(rounds: number) {
  return Number.isInteger(rounds) && rounds >= 4 && rounds <= 14
}

export async function hashBcryptPassword(password: string, rounds: number): Promise<BcryptHashResult> {
  if (!validateRounds(rounds)) {
    return {
      ok: false,
      message: 'bcrypt rounds 必须在 4 到 14 之间。',
    }
  }

  try {
    return {
      ok: true,
      hash: await bcrypt.hash(password, rounds),
      rounds,
      truncates: bcrypt.truncates(password),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'bcrypt 哈希失败。',
    }
  }
}

export async function verifyBcryptPassword(password: string, hash: string): Promise<BcryptVerifyResult> {
  if (!hash.trim()) {
    return {
      ok: false,
      message: 'bcrypt hash 不能为空。',
    }
  }

  try {
    return {
      ok: true,
      verified: await bcrypt.compare(password, hash.trim()),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'bcrypt 校验失败。',
    }
  }
}
