<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import RegexHelperTool from '@/tools/regex-helper/RegexHelperTool.vue'
import RegexTool from './RegexTool.vue'

const items = [
  {
    id: 'test',
    label: '测试',
    description: '用示例文本测试正则。',
    component: RegexTool,
  },
  {
    id: 'helper',
    label: '辅助',
    description: '解释 token 并生成预设表达式。',
    component: RegexHelperTool,
  },
]
</script>

<template>
  <ToolSuite
    title="正则工作台"
    description="合并正则测试、解释和生成辅助。"
    :items="items"
  />
</template>
