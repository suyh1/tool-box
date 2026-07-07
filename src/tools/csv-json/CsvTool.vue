<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import CsvSqlTool from '@/tools/csv-sql/CsvSqlTool.vue'
import CsvTableTool from '@/tools/csv-table/CsvTableTool.vue'
import CsvJsonTool from './CsvJsonTool.vue'

const items = [
  {
    id: 'json',
    label: 'JSON 转换',
    description: '在 CSV 和 JSON 之间转换。',
    component: CsvJsonTool,
  },
  {
    id: 'table',
    label: '表格',
    description: '预览 CSV 表格。',
    component: CsvTableTool,
  },
  {
    id: 'sql',
    label: 'SQL INSERT',
    description: '从 CSV 生成 SQL INSERT。',
    component: CsvSqlTool,
  },
]
</script>

<template>
  <ToolSuite
    title="CSV 工作台"
    description="合并 CSV / JSON 转换、表格预览和 SQL INSERT 生成。"
    :items="items"
  />
</template>
