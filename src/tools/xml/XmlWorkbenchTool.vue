<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import XmlJsonTool from '@/tools/xml-json/XmlJsonTool.vue'
import XmlXPathTool from '@/tools/xml-xpath/XmlXPathTool.vue'
import XmlTool from './XmlTool.vue'

const items = [
  {
    id: 'format',
    label: '格式化',
    description: '格式化、压缩和校验 XML。',
    component: XmlTool,
  },
  {
    id: 'json',
    label: 'JSON 转换',
    description: '在 XML 和 JSON 之间转换。',
    component: XmlJsonTool,
  },
  {
    id: 'xpath',
    label: 'XPath',
    description: '执行 XPath 表达式。',
    component: XmlXPathTool,
  },
]
</script>

<template>
  <ToolSuite
    title="XML 工作台"
    description="合并 XML 格式化、JSON 转换和 XPath 测试。"
    :items="items"
  />
</template>
