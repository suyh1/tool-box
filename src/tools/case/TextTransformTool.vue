<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import PinyinTool from '@/tools/pinyin/PinyinTool.vue'
import SlugTool from '@/tools/slug/SlugTool.vue'
import CaseTool from './CaseTool.vue'

const items = [
  {
    id: 'case',
    label: '命名格式',
    description: '转换 camel、snake、kebab 等格式。',
    component: CaseTool,
  },
  {
    id: 'slug',
    label: 'Slug',
    description: '生成 URL 安全 slug。',
    component: SlugTool,
  },
  {
    id: 'pinyin',
    label: '拼音',
    description: '把中文文本转换为拼音。',
    component: PinyinTool,
  },
]
</script>

<template>
  <ToolSuite
    title="文本命名转换"
    description="合并命名格式、slug 和拼音转换。"
    :items="items"
  />
</template>
