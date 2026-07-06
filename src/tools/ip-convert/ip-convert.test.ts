import { describe, expect, it } from 'vitest'
import { convertIpv4 } from './ip-convert'

describe('convertIpv4', () => {
  it('converts IPv4 to integer, hex, binary, and IPv4-mapped IPv6', () => {
    expect(convertIpv4('192.168.1.10')).toEqual({
      ok: true,
      ipv4: '192.168.1.10',
      integer: 3232235786,
      hex: '0xc0a8010a',
      binary: '11000000.10101000.00000001.00001010',
      ipv6Mapped: '::ffff:192.168.1.10',
    })
  })
})
