<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import JwtSignTool from '@/tools/jwt-sign/JwtSignTool.vue'
import JwtTool from './JwtTool.vue'

const items = [
  {
    id: 'decode',
    label: '解码',
    description: '本地解析 JWT header 和 payload。',
    component: JwtTool,
  },
  {
    id: 'sign',
    label: '签名 / 验签',
    description: '签发 HMAC JWT 并验证签名。',
    component: JwtSignTool,
  },
]
</script>

<template>
  <ToolSuite
    title="JWT 工作台"
    description="合并 JWT 解码、签名和验签流程，便于调试 token。"
    :items="items"
  />
</template>
