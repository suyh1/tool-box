import { describe, expect, it } from 'vitest'
import { parseCertificateSigningRequest } from './csr'

const sampleCsr = `-----BEGIN CERTIFICATE REQUEST-----
MIIC0DCCAbgCAQAwRTEaMBgGA1UEAwwRYXBpLnRvb2xib3gubG9jYWwxGjAYBgNV
BAoMEURldmVsb3BlciBUb29sYm94MQswCQYDVQQGEwJVUzCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAN0t4+/nYG6jXkxWX081K9JcUFmHfLn9RM42oWcA
sMwvrdiY22h0QkmBWOXihS3DZAB5YoHM6yxUNlboBDm3j8ik+6wHptn8w9wsprmH
RJR2JdXipB4TrF2dloa5Caq/zpgqoOe9XR0JdpUMqfBYTjtW05iHlY2vcg04g6lv
Fi2ozvzVOAEwtefyIp0Vn1y5rmBYfUDJBn7xtLUYTHasIhmt6ecE25jRl4tKrpJz
7XwJSwhawiAY9ps/I4vVUkHsWQp/Gi+wO67BEWzPn8EwPVR6MWpTV9stRwJ6meaR
OaDjVbse0DB+904KMJzJRLRvaeL5z9lbiyESdjtUKSDfidsCAwEAAaBGMEQGCSqG
SIb3DQEJDjE3MDUwMwYDVR0RBCwwKoIRYXBpLnRvb2xib3gubG9jYWyCFXd3dy5h
cGkudG9vbGJveC5sb2NhbDANBgkqhkiG9w0BAQsFAAOCAQEANIH1nQoppG9NXmM7
vjph9ABlqLsmBncSWD4Y6vVyUZoWqxURNO78THzhSvzma7ZgDqPOauV1Pe8CEMfw
rRyvQo+uOkS6/Mjc+E+OKlXcrh/1M2qW10QxYRKvHqRcbZ0W4T6kEWt4wconZ0S5
X6cyer21jMhNS7WDeFrKmuHrwDqkwnXSrB+8LQGLRmSigfKCIcEt8LMWP8396iMf
+X/6DA05adCsVJqA5OCa06YNyo6cJSYDK681leaU67JLe9glhAlQ3FGTMssZHbf1
zrRDuTiipHg/nFfQXMhEY3067MkKFJrqKuvNVvu4k2/AlcJKV+lFgI908qrpkn4W
vtHpaA==
-----END CERTIFICATE REQUEST-----`

describe('csr utilities', () => {
  it('parses PEM certificate signing requests into metadata', () => {
    const result = parseCertificateSigningRequest(sampleCsr)

    expect(result).toMatchObject({
      ok: true,
      subject: expect.stringContaining('api.toolbox.local'),
      publicKeyAlgorithm: 'RSA',
      signatureAlgorithm: expect.stringContaining('RSA'),
      dnsNames: ['api.toolbox.local', 'www.api.toolbox.local'],
      extensionCount: 1,
    })
  })

  it('returns readable errors for invalid CSRs', () => {
    expect(parseCertificateSigningRequest('not a csr')).toEqual({
      ok: false,
      message: '请输入有效的 PEM CSR。',
    })
  })
})
