<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import HmacTool from '@/tools/hmac/HmacTool.vue'
import HashTool from './HashTool.vue'

const items = [
  {
    id: 'hash',
    label: 'Hash',
    description: '生成 SHA 摘要。',
    component: HashTool,
  },
  {
    id: 'hmac',
    label: 'HMAC',
    description: '使用 secret 生成 HMAC 签名。',
    component: HmacTool,
  },
]
</script>

<template>
  <ToolSuite
    title="Hash / HMAC"
    description="把摘要和带密钥摘要放在同一个 Digest 工作区。"
    :items="items"
  />
</template>
