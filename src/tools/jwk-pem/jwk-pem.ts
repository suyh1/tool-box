export type KeyKind = 'public' | 'private'

export type KeyConversionResult =
  | {
      ok: true
      value: JsonWebKey
      keyType: KeyKind
    }
  | {
      ok: false
      message: string
    }

export type PemConversionResult =
  | {
      ok: true
      value: string
      keyType: KeyKind
    }
  | {
      ok: false
      message: string
    }

const rsaImportAlgorithm = {
  name: 'RSASSA-PKCS1-v1_5',
  hash: 'SHA-256',
}

function base64ToArrayBuffer(value: string) {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  return bytes.buffer
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

function wrapBase64(value: string) {
  return value.match(/.{1,64}/g)?.join('\n') ?? ''
}

function parsePem(pem: string) {
  const match = pem.trim().match(/-----BEGIN (PUBLIC KEY|PRIVATE KEY)-----([\s\S]+?)-----END \1-----/)

  if (!match) {
    return undefined
  }

  return {
    keyType: match[1] === 'PUBLIC KEY' ? 'public' as const : 'private' as const,
    body: match[2].replace(/\s/g, ''),
  }
}

function inferJwkKeyType(jwk: JsonWebKey): KeyKind {
  return typeof jwk.d === 'string' ? 'private' : 'public'
}

export async function pemToJwk(pem: string): Promise<KeyConversionResult> {
  const parsed = parsePem(pem)

  if (!parsed) {
    return {
      ok: false,
      message: '请输入 PUBLIC KEY 或 PRIVATE KEY PEM。',
    }
  }

  try {
    const key = await crypto.subtle.importKey(
      parsed.keyType === 'public' ? 'spki' : 'pkcs8',
      base64ToArrayBuffer(parsed.body),
      rsaImportAlgorithm,
      true,
      parsed.keyType === 'public' ? ['verify'] : ['sign'],
    )
    const value = await crypto.subtle.exportKey('jwk', key)

    return {
      ok: true,
      value,
      keyType: parsed.keyType,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'PEM 转 JWK 失败。',
    }
  }
}

export async function jwkToPem(jwk: JsonWebKey): Promise<PemConversionResult> {
  if (jwk.kty !== 'RSA') {
    return {
      ok: false,
      message: '当前仅支持 RSA JWK。',
    }
  }

  const keyType = inferJwkKeyType(jwk)

  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      rsaImportAlgorithm,
      true,
      keyType === 'public' ? ['verify'] : ['sign'],
    )
    const exported = await crypto.subtle.exportKey(keyType === 'public' ? 'spki' : 'pkcs8', key)
    const label = keyType === 'public' ? 'PUBLIC KEY' : 'PRIVATE KEY'

    return {
      ok: true,
      value: `-----BEGIN ${label}-----\n${wrapBase64(arrayBufferToBase64(exported))}\n-----END ${label}-----`,
      keyType,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'JWK 转 PEM 失败。',
    }
  }
}
