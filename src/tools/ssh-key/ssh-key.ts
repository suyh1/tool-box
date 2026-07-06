export interface SshPublicKeyMetadata {
  ok: true
  kind: 'public'
  format: 'OpenSSH public key'
  keyType: string
  bitLength: number
  fingerprint: string
  comment?: string
  curve?: string
}

export interface SshPrivateKeyMetadata {
  ok: true
  kind: 'private'
  format: 'OpenSSH private key'
  keyType: string
  bitLength: number
  fingerprint: string
  encrypted: boolean
  cipherName: string
  kdfName: string
  publicKeyCount: number
  comment?: string
  curve?: string
}

export interface SshKeyError {
  ok: false
  message: string
}

export type SshKeyResult = SshPublicKeyMetadata | SshPrivateKeyMetadata | SshKeyError

interface ParsedPublicBlob {
  keyType: string
  bitLength: number
  curve?: string
}

const textDecoder = new TextDecoder()
const openSshPrivateKeyMagic = 'openssh-key-v1\0'

class SshReader {
  private offset = 0
  private readonly bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  get remaining() {
    return this.bytes.length - this.offset
  }

  readUInt32() {
    if (this.remaining < 4) {
      throw new Error('Unexpected end of SSH key.')
    }

    const value =
      (this.bytes[this.offset] << 24) |
      (this.bytes[this.offset + 1] << 16) |
      (this.bytes[this.offset + 2] << 8) |
      this.bytes[this.offset + 3]
    this.offset += 4

    return value >>> 0
  }

  readBytes(length = this.readUInt32()) {
    if (length < 0 || this.remaining < length) {
      throw new Error('Invalid SSH key length.')
    }

    const value = this.bytes.slice(this.offset, this.offset + length)
    this.offset += length

    return value
  }

  readText() {
    return textDecoder.decode(this.readBytes())
  }

  readMagic(expected: string) {
    const magic = textDecoder.decode(this.readBytes(expected.length))

    if (magic !== expected) {
      throw new Error('Invalid OpenSSH private key magic.')
    }
  }
}

function base64ToBytes(value: string) {
  const binary = atob(value.replace(/\s+/g, ''))
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function mpintBitLength(bytes: Uint8Array) {
  let first = 0

  while (first < bytes.length - 1 && bytes[first] === 0) {
    first += 1
  }

  const significant = bytes.slice(first)

  if (significant.length === 0) {
    return 0
  }

  return (significant.length - 1) * 8 + (32 - Math.clz32(significant[0]))
}

function parsePublicBlob(blob: Uint8Array): ParsedPublicBlob {
  const reader = new SshReader(blob)
  const keyType = reader.readText()

  if (keyType === 'ssh-ed25519') {
    return {
      keyType,
      bitLength: reader.readBytes().length * 8,
    }
  }

  if (keyType === 'ssh-rsa') {
    reader.readBytes()
    const modulus = reader.readBytes()

    return {
      keyType,
      bitLength: mpintBitLength(modulus),
    }
  }

  if (keyType.startsWith('ecdsa-sha2-')) {
    const curve = reader.readText()

    return {
      keyType,
      curve,
      bitLength: curve === 'nistp521' ? 521 : Number(curve.replace('nistp', '')) || 0,
    }
  }

  return {
    keyType,
    bitLength: 0,
  }
}

async function fingerprintSha256(blob: Uint8Array) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', toArrayBuffer(blob)))

  return `SHA256:${bytesToBase64(digest).replace(/=+$/g, '')}`
}

async function inspectOpenSshPublicKey(input: string): Promise<SshPublicKeyMetadata> {
  const [declaredType, encodedKey, ...commentParts] = input.trim().split(/\s+/)

  if (!declaredType || !encodedKey) {
    throw new Error('Invalid public key.')
  }

  const blob = base64ToBytes(encodedKey)
  const parsed = parsePublicBlob(blob)

  if (parsed.keyType !== declaredType) {
    throw new Error('SSH key type does not match the key blob.')
  }

  return {
    ok: true,
    kind: 'public',
    format: 'OpenSSH public key',
    keyType: parsed.keyType,
    bitLength: parsed.bitLength,
    curve: parsed.curve,
    fingerprint: await fingerprintSha256(blob),
    comment: commentParts.join(' ') || undefined,
  }
}

function extractOpenSshPrivateBody(input: string) {
  const match = input.match(/-----BEGIN OPENSSH PRIVATE KEY-----([\s\S]+?)-----END OPENSSH PRIVATE KEY-----/)

  if (!match) {
    throw new Error('Invalid OpenSSH private key.')
  }

  return match[1]
}

function tryReadPrivateComment(privateBlock: Uint8Array, keyType: string, encrypted: boolean) {
  if (encrypted) {
    return undefined
  }

  try {
    const reader = new SshReader(privateBlock)
    const check1 = reader.readUInt32()
    const check2 = reader.readUInt32()

    if (check1 !== check2 || reader.readText() !== keyType) {
      return undefined
    }

    if (keyType === 'ssh-ed25519') {
      reader.readBytes()
      reader.readBytes()
      return reader.readText() || undefined
    }

    if (keyType === 'ssh-rsa') {
      reader.readBytes()
      reader.readBytes()
      reader.readBytes()
      reader.readBytes()
      reader.readBytes()
      reader.readBytes()
      return reader.readText() || undefined
    }

    if (keyType.startsWith('ecdsa-sha2-')) {
      reader.readText()
      reader.readBytes()
      reader.readBytes()
      return reader.readText() || undefined
    }
  } catch {
    return undefined
  }

  return undefined
}

async function inspectOpenSshPrivateKey(input: string): Promise<SshPrivateKeyMetadata> {
  const reader = new SshReader(base64ToBytes(extractOpenSshPrivateBody(input)))
  reader.readMagic(openSshPrivateKeyMagic)

  const cipherName = reader.readText()
  const kdfName = reader.readText()
  reader.readBytes()
  const publicKeyCount = reader.readUInt32()

  if (publicKeyCount < 1) {
    throw new Error('OpenSSH private key has no public key blob.')
  }

  const publicKeyBlob = reader.readBytes()
  const parsed = parsePublicBlob(publicKeyBlob)
  const encrypted = cipherName !== 'none' || kdfName !== 'none'
  const privateBlock = reader.remaining > 0 ? reader.readBytes() : new Uint8Array()

  return {
    ok: true,
    kind: 'private',
    format: 'OpenSSH private key',
    keyType: parsed.keyType,
    bitLength: parsed.bitLength,
    curve: parsed.curve,
    fingerprint: await fingerprintSha256(publicKeyBlob),
    encrypted,
    cipherName,
    kdfName,
    publicKeyCount,
    comment: tryReadPrivateComment(privateBlock, parsed.keyType, encrypted),
  }
}

export async function inspectSshKey(input: string): Promise<SshKeyResult> {
  try {
    const trimmed = input.trim()

    if (trimmed.includes('-----BEGIN OPENSSH PRIVATE KEY-----')) {
      return await inspectOpenSshPrivateKey(trimmed)
    }

    return await inspectOpenSshPublicKey(trimmed)
  } catch {
    return {
      ok: false,
      message: '请输入有效的 SSH 公钥或 OpenSSH 私钥。',
    }
  }
}
