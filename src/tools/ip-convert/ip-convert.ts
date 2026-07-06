export type Ipv4ConvertResult =
  | {
      ok: true
      ipv4: string
      integer: number
      hex: string
      binary: string
      ipv6Mapped: string
    }
  | {
      ok: false
      message: string
    }

function parseIpv4(input: string): number[] | null {
  const parts = input.trim().split('.')
  if (parts.length !== 4) {
    return null
  }

  const octets = parts.map((part) => Number(part))
  if (octets.some((octet, index) => !/^\d+$/u.test(parts[index]) || octet < 0 || octet > 255)) {
    return null
  }

  return octets
}

export function convertIpv4(input: string): Ipv4ConvertResult {
  const octets = parseIpv4(input)

  if (!octets) {
    return { ok: false, message: '请输入有效 IPv4 地址。' }
  }

  const integer = (((octets[0] * 256 + octets[1]) * 256 + octets[2]) * 256 + octets[3]) >>> 0
  const ipv4 = octets.join('.')

  return {
    ok: true,
    ipv4,
    integer,
    hex: `0x${integer.toString(16).padStart(8, '0')}`,
    binary: octets.map((octet) => octet.toString(2).padStart(8, '0')).join('.'),
    ipv6Mapped: `::ffff:${ipv4}`,
  }
}
