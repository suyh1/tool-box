export type MacAddressResult =
  | {
      ok: true
      normalized: string
      plain: string
      hyphen: string
      oui: string
      vendor: string
      isMulticast: boolean
      isLocallyAdministered: boolean
    }
  | {
      ok: false
      message: string
    }

const OUI_VENDOR_MAP: Record<string, string> = {
  '00163E': 'Xensource, Inc.',
  '001B63': 'Apple, Inc.',
  F4F5D8: 'Google, Inc.',
}

function pairs(value: string) {
  return value.match(/.{1,2}/g) ?? []
}

export function inspectMacAddress(input: string): MacAddressResult {
  const plain = input.replace(/[^0-9a-f]/giu, '').toUpperCase()

  if (!/^[0-9A-F]{12}$/u.test(plain)) {
    return { ok: false, message: '请输入 12 位十六进制 MAC 地址。' }
  }

  const octets = pairs(plain)
  const firstByte = Number.parseInt(octets[0] ?? '00', 16)
  const oui = plain.slice(0, 6)

  return {
    ok: true,
    normalized: octets.join(':'),
    plain,
    hyphen: octets.join('-'),
    oui,
    vendor: OUI_VENDOR_MAP[oui] ?? 'Unknown',
    isMulticast: (firstByte & 1) === 1,
    isLocallyAdministered: (firstByte & 2) === 2,
  }
}
