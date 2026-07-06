import { describe, expect, it } from 'vitest'
import { convertToPinyin } from './pinyin'

describe('convertToPinyin', () => {
  it('converts common Chinese characters to pinyin syllables', () => {
    expect(convertToPinyin('工具箱 重庆', {
      separator: ' ',
      keepUnknown: true,
    })).toEqual({
      text: 'gong ju xiang chong qing',
      unknownCharacters: [],
    })
  })

  it('tracks unknown Chinese characters when they are not in the local map', () => {
    expect(convertToPinyin('工具箱𠮷', {
      separator: '-',
      keepUnknown: false,
    })).toEqual({
      text: 'gong-ju-xiang',
      unknownCharacters: ['𠮷'],
    })
  })
})
