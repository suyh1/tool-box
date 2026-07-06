export type Ipv4CidrResult =
  | {
      ok: true
      ip: string
      prefix: number
      netmask: string
      wildcardMask: string
      networkAddress: string
      broadcastAddress: string
      firstHost: string
      lastHost: string
      totalAddresses: number
      usableHosts: number
    }
  | {
      ok: false
      message: string
    }

function parseIpv4(input: string): number | null {
  const parts = input.split('.')
  if (parts.length !== 4) {
    return null
  }

  const octets = parts.map((part) => Number(part))
  if (octets.some((octet, index) => !/^\d+$/u.test(parts[index]) || octet < 0 || octet > 255)) {
    return null
  }

  return (((octets[0] * 256 + octets[1]) * 256 + octets[2]) * 256 + octets[3]) >>> 0
}

function intToIpv4(value: number) {
  const normalized = value >>> 0
  return [
    normalized >>> 24,
    (normalized >>> 16) & 255,
    (normalized >>> 8) & 255,
    normalized & 255,
  ].join('.')
}

export function calculateIpv4Cidr(input: string): Ipv4CidrResult {
  const match = input.trim().match(/^(.+)\/(\d{1,2})$/u)
  const ipValue = match ? parseIpv4(match[1]) : null
  const prefix = match ? Number(match[2]) : Number.NaN

  if (ipValue === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return { ok: false, message: '请输入有效 IPv4 CIDR，例如 192.168.1.10/24。' }
  }

  const netmask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const wildcard = (~netmask) >>> 0
  const network = (ipValue & netmask) >>> 0
  const broadcast = (network | wildcard) >>> 0
  const totalAddresses = 2 ** (32 - prefix)
  const usableHosts = prefix >= 31 ? totalAddresses : Math.max(0, totalAddresses - 2)
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0

  return {
    ok: true,
    ip: intToIpv4(ipValue),
    prefix,
    netmask: intToIpv4(netmask),
    wildcardMask: intToIpv4(wildcard),
    networkAddress: intToIpv4(network),
    broadcastAddress: intToIpv4(broadcast),
    firstHost: intToIpv4(firstHost),
    lastHost: intToIpv4(lastHost),
    totalAddresses,
    usableHosts,
  }
}
