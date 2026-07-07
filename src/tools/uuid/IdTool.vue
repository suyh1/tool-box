<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import NanoIdTool from '@/tools/nanoid/NanoIdTool.vue'
import SnowflakeTool from '@/tools/snowflake/SnowflakeTool.vue'
import UlidTool from '@/tools/ulid/UlidTool.vue'
import UuidTool from './UuidTool.vue'

const items = [
  {
    id: 'uuid',
    label: 'UUID',
    description: '生成随机 UUID。',
    component: UuidTool,
  },
  {
    id: 'snowflake',
    label: 'Snowflake',
    description: '解析和生成 Snowflake ID。',
    component: SnowflakeTool,
  },
  {
    id: 'ulid',
    label: 'ULID',
    description: '生成可排序 ULID。',
    component: UlidTool,
  },
  {
    id: 'nanoid',
    label: 'Nano ID',
    description: '生成短随机 ID。',
    component: NanoIdTool,
  },
]
</script>

<template>
  <ToolSuite
    title="ID 生成器"
    description="集中生成和检查 UUID、Snowflake、ULID 与 Nano ID。"
    :items="items"
  />
</template>
