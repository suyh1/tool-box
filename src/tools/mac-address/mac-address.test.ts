import { describe, expect, it } from 'vitest'
import { inspectMacAddress } from './mac-address'

describe('inspectMacAddress', () => {
  it('normalizes MAC addresses and looks up a local OUI vendor', () => {
    expect(inspectMacAddress('00-16-3E-AA-BB-CC')).toEqual({
      ok: true,
      normalized: '00:16:3E:AA:BB:CC',
      plain: '00163EAABBCC',
      hyphen: '00-16-3E-AA-BB-CC',
      oui: '00163E',
      vendor: 'Xensource, Inc.',
      isMulticast: false,
      isLocallyAdministered: false,
    })
  })

  it('rejects invalid MAC addresses', () => {
    expect(inspectMacAddress('not-mac')).toEqual({
      ok: false,
      message: '请输入 12 位十六进制 MAC 地址。',
    })
  })
})
