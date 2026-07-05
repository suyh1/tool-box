<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { decodeBase64, encodeBase64 } from './base64'

const actions = [
  {
    label: 'Base64 编码',
    run: (input: string) => ({
      ok: true as const,
      value: encodeBase64(input),
      meta: '编码完成',
    }),
  },
  {
    label: 'Base64 解码',
    run: (input: string) => {
      const result = decodeBase64(input)

      return result.ok
        ? { ok: true as const, value: result.value, meta: '解码完成' }
        : result
    },
  },
]
</script>

<template>
  <TextTool
    title="Base64 编解码"
    description="在浏览器内编码和解码 UTF-8 文本，内容不会离开本机。"
    input-label="输入"
    output-label="输出"
    input-aria-label="Base64 输入"
    output-aria-label="Base64 输出"
    placeholder="hello"
    sample="hello"
    :actions="actions"
  />
</template>
