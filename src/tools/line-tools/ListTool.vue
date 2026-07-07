<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import DelimiterConvertTool from '@/tools/delimiter-convert/DelimiterConvertTool.vue'
import ListRandomTool from '@/tools/list-random/ListRandomTool.vue'
import LineToolsTool from './LineToolsTool.vue'

const items = [
  {
    id: 'lines',
    label: '行处理',
    description: '修剪、排序和去重多行文本。',
    component: LineToolsTool,
  },
  {
    id: 'random',
    label: '随机 / 抽样',
    description: '洗牌或抽取列表项。',
    component: ListRandomTool,
  },
  {
    id: 'delimiter',
    label: '分隔符',
    description: '在常见列表分隔符之间转换。',
    component: DelimiterConvertTool,
  },
]
</script>

<template>
  <ToolSuite
    title="列表工具"
    description="合并行排序去重、列表随机化和分隔符转换。"
    :items="items"
  />
</template>
