<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { decodeUrlComponent, encodeUrlComponent } from './url'

const actions = [
  {
    label: 'URL 编码',
    run: (input: string) => ({
      ok: true as const,
      value: encodeUrlComponent(input),
      meta: '编码完成',
    }),
  },
  {
    label: 'URL 解码',
    run: (input: string) => {
      const result = decodeUrlComponent(input)

      return result.ok
        ? { ok: true as const, value: result.value, meta: '解码完成' }
        : result
    },
  },
]
</script>

<template>
  <TextTool
    title="URL 编解码"
    description="为查询字符串、路径和载荷片段编码或解码 URL 组件。"
    input-label="输入"
    output-label="输出"
    input-aria-label="URL 输入"
    output-aria-label="URL 输出"
    placeholder="a b+c"
    sample="a b+c"
    :actions="actions"
  />
</template>
