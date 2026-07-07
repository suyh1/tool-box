<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import ContrastTool from '@/tools/contrast/ContrastTool.vue'
import PaletteTool from '@/tools/palette/PaletteTool.vue'
import ColorTool from './ColorTool.vue'

const items = [
  {
    id: 'convert',
    label: '转换',
    description: '在 HEX、RGB、HSL 和 OKLCH 之间转换。',
    component: ColorTool,
  },
  {
    id: 'palette',
    label: '调色板',
    description: '从基础颜色生成色板。',
    component: PaletteTool,
  },
  {
    id: 'contrast',
    label: '对比度',
    description: '检查 WCAG 对比度。',
    component: ContrastTool,
  },
]
</script>

<template>
  <ToolSuite
    title="颜色工作台"
    description="合并颜色转换、调色板生成和对比度检查。"
    :items="items"
  />
</template>
