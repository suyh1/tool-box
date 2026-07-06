export interface PinyinOptions {
  separator: string
  keepUnknown: boolean
}

export interface PinyinResult {
  text: string
  unknownCharacters: string[]
}

const PINYIN_MAP: Record<string, string> = {
  工: 'gong',
  具: 'ju',
  箱: 'xiang',
  重: 'chong',
  庆: 'qing',
  中: 'zhong',
  文: 'wen',
  拼: 'pin',
  音: 'yin',
  转: 'zhuan',
  换: 'huan',
  开: 'kai',
  发: 'fa',
  工具: 'gong ju',
}

function isHan(character: string) {
  return /\p{Script=Han}/u.test(character)
}

export function convertToPinyin(input: string, options: PinyinOptions): PinyinResult {
  const tokens: string[] = []
  const unknownCharacters: string[] = []

  for (const character of input) {
    if (PINYIN_MAP[character]) {
      tokens.push(PINYIN_MAP[character])
      continue
    }

    if (/\s/u.test(character)) {
      continue
    }

    if (isHan(character)) {
      unknownCharacters.push(character)

      if (options.keepUnknown) {
        tokens.push(character)
      }

      continue
    }

    if (/[A-Za-z0-9]/u.test(character) || options.keepUnknown) {
      tokens.push(character)
    }
  }

  return {
    text: tokens.join(options.separator),
    unknownCharacters,
  }
}
