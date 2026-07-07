<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import PassphraseTool from '@/tools/passphrase/PassphraseTool.vue'
import RandomStringTool from '@/tools/random-string/RandomStringTool.vue'
import PasswordTool from './PasswordTool.vue'

const items = [
  {
    id: 'password',
    label: '密码',
    description: '生成随机密码。',
    component: PasswordTool,
  },
  {
    id: 'passphrase',
    label: 'Passphrase',
    description: '生成易记随机短语。',
    component: PassphraseTool,
  },
  {
    id: 'random-string',
    label: '随机字符串',
    description: '按字符集生成随机字符串。',
    component: RandomStringTool,
  },
]
</script>

<template>
  <ToolSuite
    title="密码 / 随机生成"
    description="合并密码、passphrase 和随机字符串生成。"
    :items="items"
  />
</template>
