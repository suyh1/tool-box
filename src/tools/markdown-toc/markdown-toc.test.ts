import { describe, expect, it } from 'vitest'
import { generateMarkdownToc } from './markdown-toc'

describe('markdown toc utilities', () => {
  it('generates an unordered TOC from markdown headings', () => {
    const result = generateMarkdownToc('# Guide\n\n## Install\n\n### Local Setup\n\n## Usage')

    expect(result).toEqual({
      ok: true,
      value: [
        '- [Install](#install)',
        '  - [Local Setup](#local-setup)',
        '- [Usage](#usage)',
      ].join('\n'),
      meta: '已生成 3 个目录项',
    })
  })

  it('can include h1 headings and output ordered markdown lists', () => {
    const result = generateMarkdownToc('# Guide\n\n## Install', {
      minLevel: 1,
      ordered: true,
    })

    expect(result).toEqual({
      ok: true,
      value: [
        '1. [Guide](#guide)',
        '  1. [Install](#install)',
      ].join('\n'),
      meta: '已生成 2 个目录项',
    })
  })

  it('keeps duplicate heading anchors stable', () => {
    const result = generateMarkdownToc('## API\n\n## API\n\n### API', {
      maxLevel: 3,
    })

    expect(result).toEqual({
      ok: true,
      value: [
        '- [API](#api)',
        '- [API](#api-2)',
        '  - [API](#api-3)',
      ].join('\n'),
      meta: '已生成 3 个目录项',
    })
  })

  it('rejects markdown without eligible headings', () => {
    expect(generateMarkdownToc('plain text')).toEqual({
      ok: false,
      message: '未找到可生成目录的标题。',
    })
  })
})
