import { describe, expect, it } from 'vitest'
import { parseX509Certificate } from './x509-cert'

const sampleCertificate = `-----BEGIN CERTIFICATE-----
MIIDNDCCAhygAwIBAgIJANX0kt1+HovuMA0GCSqGSIb3DQEBCwUAMEExFjAUBgNV
BAMMDXRvb2xib3gubG9jYWwxGjAYBgNVBAoMEURldmVsb3BlciBUb29sYm94MQsw
CQYDVQQGEwJVUzAeFw0yNjA3MDYxMjQzMzlaFw0yNzA3MDYxMjQzMzlaMEExFjAU
BgNVBAMMDXRvb2xib3gubG9jYWwxGjAYBgNVBAoMEURldmVsb3BlciBUb29sYm94
MQswCQYDVQQGEwJVUzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKlm
Y9KcHHeEVxklffcWelFr1/5gaaHnwCTtK4r8DNtG2bKQCW9a5SiQfi+6VNoGQNnb
1HHBxpou1FJ+U+0vGHYNlA5BQMm530r6Kqmnp2O3iV8tFZAIsYowHtKmro+HqFQ7
GYRrsXt4ZO79c/M6hJm3jnZHZpcqbBkFojlgJuSUX7Qrze39d39b2fJbhh7XPacP
sWgH8ceK0PR3Q7BKfZkLKsbXJQ5c+V4jEHLnNbDijz4ZY5Um32kgAfO9tYo5ML7M
taPkSmxAsOjYfjDt1kz+iizkLXVFKYyYZWWzEYM0D6YP5CaYaSAlUUCdvesHgLs+
KSNd/3nG7aLpaK+pulcCAwEAAaMvMC0wKwYDVR0RBCQwIoINdG9vbGJveC5sb2Nh
bIIRd3d3LnRvb2xib3gubG9jYWwwDQYJKoZIhvcNAQELBQADggEBAAvvjcpVgtLX
iE8L3OybVXDb3ZkgovZaPQIasA/K47EnuCvO68yqdNjrMmjVd3l9GOawYc2nxN+f
Sy5Xa+LnVSlygFIZ6fcDMIXGrgmBb6iBQup69nHovK7sa48BnYbtvFaRG02/muUK
LSEbFHVYpzvCqDlDB7SMS395ivu3aKiOH+QGs1SvtYFV2v6GBsOhO4FigaqWF0zx
Y5z53ox8JTZhiBhkYyKhqrm9sKr1NlRHgINwvR0qEdPYSgrOtMGTqAD6xbgEDurs
SZjSs8T9wvpp5EJ08deLJGjai3YVRBVd0ap6lYpAvr4b1gLah+63YsJ26/mEaCiN
YOABgFgaaYw=
-----END CERTIFICATE-----`

describe('x509 certificate utilities', () => {
  it('parses PEM certificates into certificate metadata', () => {
    const result = parseX509Certificate(sampleCertificate)

    expect(result).toMatchObject({
      ok: true,
      subject: expect.stringContaining('toolbox.local'),
      issuer: expect.stringContaining('Developer Toolbox'),
      publicKeyAlgorithm: 'RSA',
      signatureAlgorithm: expect.stringContaining('RSA'),
      dnsNames: ['toolbox.local', 'www.toolbox.local'],
    })

    if (!result.ok) {
      throw new Error(result.message)
    }

    expect(result.serialNumber).toBeTruthy()
    expect(result.notBefore).toContain('2026-07-06')
    expect(result.notAfter).toContain('2027-07-06')
  })

  it('returns readable errors for invalid certificates', () => {
    expect(parseX509Certificate('not a certificate')).toEqual({
      ok: false,
      message: '请输入有效的 X.509 PEM 证书。',
    })
  })
})
