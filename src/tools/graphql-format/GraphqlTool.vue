<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import GraphqlVariablesTool from '@/tools/graphql-variables/GraphqlVariablesTool.vue'
import GraphqlFormatTool from './GraphqlFormatTool.vue'

const items = [
  {
    id: 'format',
    label: '格式化',
    description: '格式化 GraphQL query 和 mutation。',
    component: GraphqlFormatTool,
  },
  {
    id: 'variables',
    label: 'Variables',
    description: '检查 operation 和 variables JSON 是否匹配。',
    component: GraphqlVariablesTool,
  },
]
</script>

<template>
  <ToolSuite
    title="GraphQL 工作台"
    description="把 GraphQL 格式化和 variables 检查放到同一个 API schema 工作区。"
    :items="items"
  />
</template>
