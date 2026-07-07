<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import QueryEditorTool from '@/tools/query-editor/QueryEditorTool.vue'
import UrlParserTool from '@/tools/url-parser/UrlParserTool.vue'
import UrlTool from './UrlTool.vue'

const items = [
  {
    id: 'codec',
    label: '编解码',
    description: 'URL 组件编码与解码。',
    component: UrlTool,
  },
  {
    id: 'parser',
    label: '解析',
    description: '拆解完整 URL 的协议、主机、路径和参数。',
    component: UrlParserTool,
  },
  {
    id: 'query',
    label: 'Query',
    description: '解析、重建和更新 query 参数。',
    component: QueryEditorTool,
  },
]
</script>

<template>
  <ToolSuite
    title="URL 工作台"
    description="把 URL 编解码、结构解析和 query 参数编辑合并到同一个工作区。"
    :items="items"
  />
</template>
