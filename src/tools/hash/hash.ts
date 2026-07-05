export const supportedHashAlgorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const

export type HashAlgorithm = typeof supportedHashAlgorithms[number]

export type HashResult = {
  ok: true
  value: string
} | {
  ok: false
  message: string
}

function isHashAlgorithm(algorithm: string): algorithm is HashAlgorithm {
  return supportedHashAlgorithms.includes(algorithm as HashAlgorithm)
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function digestText(input: string, algorithm: string): Promise<HashResult> {
  if (!isHashAlgorithm(algorithm)) {
    return {
      ok: false,
      message: `Unsupported hash algorithm: ${algorithm}`,
    }
  }

  try {
    const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input))

    return {
      ok: true,
      value: toHex(digest),
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to generate hash',
    }
  }
}
