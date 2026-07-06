export interface AsciiRow {
  decimal: number
  hex: string
  binary: string
  display: string
  kind: 'control' | 'printable'
}

export interface CharacterCodeRow {
  character: string
  codePoint: number
  hex: string
  binary: string
  htmlEntity: string
}

const controlLabels = [
  'NUL',
  'SOH',
  'STX',
  'ETX',
  'EOT',
  'ENQ',
  'ACK',
  'BEL',
  'BS',
  'TAB',
  'LF',
  'VT',
  'FF',
  'CR',
  'SO',
  'SI',
  'DLE',
  'DC1',
  'DC2',
  'DC3',
  'DC4',
  'NAK',
  'SYN',
  'ETB',
  'CAN',
  'EM',
  'SUB',
  'ESC',
  'FS',
  'GS',
  'RS',
  'US',
]

function hex(value: number, minLength: number) {
  return value.toString(16).toUpperCase().padStart(minLength, '0')
}

function binary(value: number, minLength: number) {
  return value.toString(2).padStart(minLength, '0')
}

export function getAsciiTable(): AsciiRow[] {
  return Array.from({ length: 128 }, (_, decimal) => {
    const isControl = decimal < 32 || decimal === 127

    return {
      decimal,
      hex: hex(decimal, 2),
      binary: binary(decimal, 8),
      display: isControl ? (decimal === 127 ? 'DEL' : controlLabels[decimal]) : String.fromCharCode(decimal),
      kind: isControl ? 'control' : 'printable',
    }
  })
}

export function analyzeCharacters(input: string): CharacterCodeRow[] {
  return [...input].map((character) => {
    const codePoint = character.codePointAt(0) ?? 0

    return {
      character,
      codePoint,
      hex: hex(codePoint, 4),
      binary: binary(codePoint, codePoint <= 0xff ? 8 : codePoint.toString(2).length),
      htmlEntity: `&#${codePoint};`,
    }
  })
}
