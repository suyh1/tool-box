export const supportedRsaKeyAlgorithms = ['RSASSA-PKCS1-v1_5', 'RSA-PSS', 'RSA-OAEP'] as const
export const supportedRsaHashes = ['SHA-256', 'SHA-384', 'SHA-512'] as const
export const supportedRsaModulusLengths = [2048, 3072, 4096] as const

export type RsaKeyAlgorithm = typeof supportedRsaKeyAlgorithms[number]
export type RsaHash = typeof supportedRsaHashes[number]
export type RsaModulusLength = typeof supportedRsaModulusLengths[number]

export interface GenerateRsaKeyPairOptions {
  algorithm: string
  hash: string
  modulusLength: number
}

export type GenerateRsaKeyPairResult =
  | {
      ok: true
      algorithm: RsaKeyAlgorithm
      hash: RsaHash
      modulusLength: RsaModulusLength
      publicPem: string
      privatePem: string
      publicJwk: JsonWebKey
      privateJwk: JsonWebKey
    }
  | {
      ok: false
      message: string
    }

function isRsaKeyAlgorithm(value: string): value is RsaKeyAlgorithm {
  return supportedRsaKeyAlgorithms.includes(value as RsaKeyAlgorithm)
}

function isRsaHash(value: string): value is RsaHash {
  return supportedRsaHashes.includes(value as RsaHash)
}

function isRsaModulusLength(value: number): value is RsaModulusLength {
  return supportedRsaModulusLengths.includes(value as RsaModulusLength)
}

function arrayBufferToPem(buffer: ArrayBuffer, label: string) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  const body = btoa(binary).match(/.{1,64}/g)?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`
}

function keyUsagesForAlgorithm(algorithm: RsaKeyAlgorithm): KeyUsage[] {
  return algorithm === 'RSA-OAEP' ? ['encrypt', 'decrypt'] : ['sign', 'verify']
}

export async function generateRsaKeyPair(options: GenerateRsaKeyPairOptions): Promise<GenerateRsaKeyPairResult> {
  if (!isRsaKeyAlgorithm(options.algorithm)) {
    return {
      ok: false,
      message: `不支持的 RSA 算法：${options.algorithm}`,
    }
  }

  if (!isRsaHash(options.hash)) {
    return {
      ok: false,
      message: `不支持的 RSA hash：${options.hash}`,
    }
  }

  if (!isRsaModulusLength(options.modulusLength)) {
    return {
      ok: false,
      message: 'RSA 模长必须是 2048、3072 或 4096。',
    }
  }

  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: options.algorithm,
        modulusLength: options.modulusLength,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: options.hash,
      },
      true,
      keyUsagesForAlgorithm(options.algorithm),
    ) as CryptoKeyPair
    const [spki, pkcs8, publicJwk, privateJwk] = await Promise.all([
      crypto.subtle.exportKey('spki', keyPair.publicKey),
      crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
      crypto.subtle.exportKey('jwk', keyPair.publicKey),
      crypto.subtle.exportKey('jwk', keyPair.privateKey),
    ])

    return {
      ok: true,
      algorithm: options.algorithm,
      hash: options.hash,
      modulusLength: options.modulusLength,
      publicPem: arrayBufferToPem(spki, 'PUBLIC KEY'),
      privatePem: arrayBufferToPem(pkcs8, 'PRIVATE KEY'),
      publicJwk,
      privateJwk,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'RSA 密钥生成失败。',
    }
  }
}
