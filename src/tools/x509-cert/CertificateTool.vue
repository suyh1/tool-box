<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import CsrTool from '@/tools/csr/CsrTool.vue'
import X509CertTool from './X509CertTool.vue'

const items = [
  {
    id: 'certificate',
    label: '证书',
    description: '解析 PEM X.509 证书。',
    component: X509CertTool,
  },
  {
    id: 'csr',
    label: 'CSR',
    description: '解析证书签名请求。',
    component: CsrTool,
  },
]
</script>

<template>
  <ToolSuite
    title="证书 / CSR 解析"
    description="把证书和证书签名请求解析集中到同一个安全工作区。"
    :items="items"
  />
</template>
