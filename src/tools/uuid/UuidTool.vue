<script setup lang="ts">
import TextTool from '@/tools/_shared/TextTool.vue'
import { generateUuids } from './uuid'

const actions = [
  {
    label: '生成 UUID',
    run: () => ({
      ok: true as const,
      value: generateUuids(1).join('\n'),
      meta: '已生成',
    }),
  },
  {
    label: '生成 10 个',
    run: () => ({
      ok: true as const,
      value: generateUuids(10).join('\n'),
      meta: '已生成 10 个',
    }),
  },
]
</script>

<template>
  <TextTool
    title="UUID 生成"
    description="生成浏览器原生 UUID v4，可用于 ID、测试数据和请求追踪。"
    input-label="选项"
    output-label="生成的 UUID"
    input-aria-label="UUID 输入"
    output-aria-label="UUID 输出"
    placeholder="输入可留空"
    sample=""
    :actions="actions"
  />
</template>
