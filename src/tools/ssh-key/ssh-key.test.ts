import { describe, expect, it } from 'vitest'
import { inspectSshKey } from './ssh-key'

const samplePublicKey =
  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHRXoxcoDbj82TZ5Tfa61ZmGACsrsYY9v/XJVjMBq8NT dev@toolbox'

const samplePrivateKey = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACB0V6MXKA24/Nk2eU32utWZhgArK7GGPb/1yVYzAavDUwAAAJAzfjsCM347
AgAAAAtzc2gtZWQyNTUxOQAAACB0V6MXKA24/Nk2eU32utWZhgArK7GGPb/1yVYzAavDUw
AAAEAZ7CYpvbOZ2pINQfruu9GWcHbBWv4iIWyqJgsZTZIOyHRXoxcoDbj82TZ5Tfa61ZmG
ACsrsYY9v/XJVjMBq8NTAAAAC2RldkB0b29sYm94AQI=
-----END OPENSSH PRIVATE KEY-----`

describe('ssh key utilities', () => {
  it('inspects OpenSSH public key metadata', async () => {
    await expect(inspectSshKey(samplePublicKey)).resolves.toMatchObject({
      ok: true,
      kind: 'public',
      format: 'OpenSSH public key',
      keyType: 'ssh-ed25519',
      comment: 'dev@toolbox',
      bitLength: 256,
      fingerprint: 'SHA256:mXYr1DAIuUurG13g0mjVOigfTP/DGyBn93clsVZJzWo',
    })
  })

  it('inspects OpenSSH private key metadata from the embedded public key', async () => {
    await expect(inspectSshKey(samplePrivateKey)).resolves.toMatchObject({
      ok: true,
      kind: 'private',
      format: 'OpenSSH private key',
      keyType: 'ssh-ed25519',
      encrypted: false,
      publicKeyCount: 1,
      bitLength: 256,
      fingerprint: 'SHA256:mXYr1DAIuUurG13g0mjVOigfTP/DGyBn93clsVZJzWo',
    })
  })

  it('returns readable errors for invalid SSH keys', async () => {
    await expect(inspectSshKey('not a key')).resolves.toEqual({
      ok: false,
      message: '请输入有效的 SSH 公钥或 OpenSSH 私钥。',
    })
  })
})
