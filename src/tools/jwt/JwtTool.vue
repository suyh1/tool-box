<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { decodeJwt } from './jwt'

const sampleToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRvb2xib3giLCJhZG1pbiI6dHJ1ZX0',
  'signature',
].join('.')

const actions = [
  {
    label: '解码 JWT',
    run: (input: string) => {
      const result = decodeJwt(input)

      return result.ok
        ? {
            ok: true as const,
            value: [
              '签名状态：未验证',
              '',
              '标头',
              JSON.stringify(result.header, null, 2),
              '',
              '载荷',
              JSON.stringify(result.payload, null, 2),
              '',
              `签名: ${result.signature}`,
            ].join('\n'),
            meta: '已解码，未验证',
          }
        : result
    },
  },
]
</script>

<template>
  <TextTool
    title="JWT 解码"
    description="在本地解码 JWT 标头和载荷。此工具不会验证签名。"
    input-label="JWT"
    output-label="解码结果"
    input-aria-label="JWT 输入"
    output-aria-label="JWT 输出"
    placeholder="header.payload.signature"
    input-empty-message="粘贴 JWT 字符串。工具只解码标头和载荷，不验证签名。"
    output-empty-message="解码后会显示标头、载荷和签名片段。"
    :sample="sampleToken"
    :actions="actions"
  />
</template>
