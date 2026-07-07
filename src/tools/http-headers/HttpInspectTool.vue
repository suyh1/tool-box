<script setup lang="ts">
import ToolSuite from '@/tools/_shared/ToolSuite.vue'
import CookieParserTool from '@/tools/cookie-parser/CookieParserTool.vue'
import UserAgentTool from '@/tools/user-agent/UserAgentTool.vue'
import HttpHeadersTool from './HttpHeadersTool.vue'

const items = [
  {
    id: 'headers',
    label: 'Headers',
    description: '解析 HTTP headers。',
    component: HttpHeadersTool,
  },
  {
    id: 'cookies',
    label: 'Cookies',
    description: '解析 Cookie 和 Set-Cookie。',
    component: CookieParserTool,
  },
  {
    id: 'user-agent',
    label: 'User-Agent',
    description: '解析浏览器和设备信息。',
    component: UserAgentTool,
  },
]
</script>

<template>
  <ToolSuite
    title="HTTP 解析工具"
    description="合并 headers、cookie 和 user-agent 解析。"
    :items="items"
  />
</template>
