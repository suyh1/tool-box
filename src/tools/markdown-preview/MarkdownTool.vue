<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import MarkdownTocTool from '@/tools/markdown-toc/MarkdownTocTool.vue'
import MarkdownPreviewTool from './MarkdownPreviewTool.vue'

const items = [
  {
    id: 'preview',
    label: '预览',
    description: '渲染 Markdown 并查看 HTML。',
    component: MarkdownPreviewTool,
  },
  {
    id: 'toc',
    label: 'TOC',
    description: '从标题生成目录。',
    component: MarkdownTocTool,
  },
]
</script>

<template>
  <ToolSuite
    title="Markdown 工作台"
    description="合并 Markdown 预览和目录生成。"
    :items="items"
  />
</template>
