<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import RsaSignTool from '@/tools/rsa-sign/RsaSignTool.vue'
import RsaKeyTool from './RsaKeyTool.vue'

const items = [
  {
    id: 'key',
    label: '密钥',
    description: '生成 RSA 公私钥并导出。',
    component: RsaKeyTool,
  },
  {
    id: 'sign',
    label: '签名 / 验签',
    description: '使用 RSA 密钥生成和验证签名。',
    component: RsaSignTool,
  },
]
</script>

<template>
  <ToolSuite
    title="RSA 工具"
    description="合并 RSA 密钥生成、签名和验签。"
    :items="items"
  />
</template>
