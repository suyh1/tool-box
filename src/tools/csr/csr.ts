import 'reflect-metadata'
import { DNS, Pkcs10CertificateRequest, SubjectAlternativeNameExtension } from '@peculiar/x509'
import type { Extension } from '@peculiar/x509'

export interface CsrMetadata {
  ok: true
  subject: string
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  dnsNames: string[]
  attributeCount: number
  extensionCount: number
}

export interface CsrError {
  ok: false
  message: string
}

export type CsrResult = CsrMetadata | CsrError

function formatAlgorithmName(algorithm: Algorithm | undefined) {
  const name = algorithm?.name ?? 'Unknown'
  const hash = 'hash' in (algorithm ?? {}) ? (algorithm as { hash?: Algorithm }).hash?.name : undefined

  if (hash) {
    return `${name.replace('RSASSA-PKCS1-v1_5', 'RSA')} / ${hash}`
  }

  return name.replace('RSASSA-PKCS1-v1_5', 'RSA')
}

function getPublicKeyAlgorithm(algorithm: Algorithm | undefined) {
  const name = algorithm?.name ?? 'Unknown'
  const upperName = name.toUpperCase()

  if (upperName.includes('RSA')) {
    return 'RSA'
  }

  if (upperName === 'EC' || upperName.includes('ECDSA')) {
    return 'EC'
  }

  if (upperName.includes('ED25519')) {
    return 'Ed25519'
  }

  if (upperName.includes('ED448')) {
    return 'Ed448'
  }

  return name
}

function asSubjectAlternativeNameExtension(extension: Extension) {
  if (extension instanceof SubjectAlternativeNameExtension) {
    return extension
  }

  if (extension.type !== SubjectAlternativeNameExtension.NAME) {
    return null
  }

  try {
    return new SubjectAlternativeNameExtension(extension.value)
  } catch {
    return null
  }
}

function getDnsNames(request: Pkcs10CertificateRequest) {
  for (const extension of request.extensions) {
    const sanExtension = asSubjectAlternativeNameExtension(extension)

    if (sanExtension) {
      return sanExtension.names.items.filter((name) => name.type === DNS).map((name) => name.value)
    }
  }

  return []
}

export function parseCertificateSigningRequest(input: string): CsrResult {
  try {
    const request = new Pkcs10CertificateRequest(input.trim())

    return {
      ok: true,
      subject: request.subject,
      signatureAlgorithm: formatAlgorithmName(request.signatureAlgorithm),
      publicKeyAlgorithm: getPublicKeyAlgorithm(request.publicKey.algorithm),
      dnsNames: getDnsNames(request),
      attributeCount: request.attributes.length,
      extensionCount: request.extensions.length,
    }
  } catch {
    return {
      ok: false,
      message: '请输入有效的 PEM CSR。',
    }
  }
}
