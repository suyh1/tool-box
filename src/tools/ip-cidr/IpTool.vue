<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import IpConvertTool from '@/tools/ip-convert/IpConvertTool.vue'
import IpCidrTool from './IpCidrTool.vue'

const items = [
  {
    id: 'cidr',
    label: 'CIDR',
    description: '计算 IPv4 CIDR 网络信息。',
    component: IpCidrTool,
  },
  {
    id: 'convert',
    label: 'IPv4 / IPv6',
    description: '转换 IPv4 的整数、HEX、二进制和 IPv6 映射表示。',
    component: IpConvertTool,
  },
]
</script>

<template>
  <ToolSuite
    title="IP 工具"
    description="合并 CIDR 计算和 IPv4 / IPv6 表示转换。"
    :items="items"
  />
</template>
