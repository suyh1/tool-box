<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import QrDecodeTool from '@/tools/qr-decode/QrDecodeTool.vue'
import QrCodeTool from './QrCodeTool.vue'

const items = [
  {
    id: 'generate',
    label: '生成',
    description: '把文本或 URL 编码为 QR Code。',
    component: QrCodeTool,
  },
  {
    id: 'decode',
    label: '解码',
    description: '从本地图片识别 QR Code 内容。',
    component: QrDecodeTool,
  },
]
</script>

<template>
  <ToolSuite
    title="QR Code 工具"
    description="在同一个工具里生成和解码 QR Code。"
    :items="items"
  />
</template>
