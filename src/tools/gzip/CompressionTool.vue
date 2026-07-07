<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import BrotliTool from '@/tools/brotli/BrotliTool.vue'
import GzipTool from './GzipTool.vue'

const items = [
  {
    id: 'gzip',
    label: 'Gzip',
    description: 'Gzip Base64 压缩与解压。',
    component: GzipTool,
  },
  {
    id: 'brotli',
    label: 'Brotli',
    description: 'Brotli Base64 压缩与解压。',
    component: BrotliTool,
  },
]
</script>

<template>
  <ToolSuite
    title="压缩 / 解压工作台"
    description="把 Gzip 和 Brotli 文本压缩流程放到同一个工作区。"
    :items="items"
  />
</template>
