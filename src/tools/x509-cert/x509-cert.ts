import 'reflect-metadata'
import { DNS, SubjectAlternativeNameExtension, X509Certificate } from '@peculiar/x509'

export interface X509CertificateMetadata {
  ok: true
  subject: string
  issuer: string
  serialNumber: string
  notBefore: string
  notAfter: string
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  dnsNames: string[]
  expired: boolean
}

export interface X509CertificateError {
  ok: false
  message: string
}

export type X509CertificateResult = X509CertificateMetadata | X509CertificateError

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

function getDnsNames(certificate: X509Certificate) {
  const extension = certificate.getExtension(SubjectAlternativeNameExtension)

  if (!extension) {
    return []
  }

  return extension.names.items.filter((name) => name.type === DNS).map((name) => name.value)
}

export function parseX509Certificate(input: string): X509CertificateResult {
  try {
    const certificate = new X509Certificate(input.trim())

    return {
      ok: true,
      subject: certificate.subject,
      issuer: certificate.issuer,
      serialNumber: certificate.serialNumber,
      notBefore: certificate.notBefore.toISOString(),
      notAfter: certificate.notAfter.toISOString(),
      signatureAlgorithm: formatAlgorithmName(certificate.signatureAlgorithm),
      publicKeyAlgorithm: getPublicKeyAlgorithm(certificate.publicKey.algorithm),
      dnsNames: getDnsNames(certificate),
      expired: certificate.notAfter.getTime() < Date.now(),
    }
  } catch {
    return {
      ok: false,
      message: '请输入有效的 X.509 PEM 证书。',
    }
  }
}
