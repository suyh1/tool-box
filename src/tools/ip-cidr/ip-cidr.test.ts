import { describe, expect, it } from 'vitest'
import { calculateIpv4Cidr } from './ip-cidr'

describe('calculateIpv4Cidr', () => {
  it('calculates network, broadcast, host range, and masks for IPv4 CIDR', () => {
    expect(calculateIpv4Cidr('192.168.1.10/24')).toEqual({
      ok: true,
      ip: '192.168.1.10',
      prefix: 24,
      netmask: '255.255.255.0',
      wildcardMask: '0.0.0.255',
      networkAddress: '192.168.1.0',
      broadcastAddress: '192.168.1.255',
      firstHost: '192.168.1.1',
      lastHost: '192.168.1.254',
      totalAddresses: 256,
      usableHosts: 254,
    })
  })

  it('rejects invalid CIDR values', () => {
    expect(calculateIpv4Cidr('999.1.1.1/40')).toEqual({
      ok: false,
      message: '请输入有效 IPv4 CIDR，例如 192.168.1.10/24。',
    })
  })
})
