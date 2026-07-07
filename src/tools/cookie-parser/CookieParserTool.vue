<script setup lang="ts">
import { Check, Clipboard, Cookie, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseCookieHeader, parseSetCookieHeader } from './cookie-parser'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('sid=abc; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600')
const mode = ref<'cookie' | 'set-cookie'>('set-cookie')
const output = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('Cookie / Set-Cookie')

const canCopy = computed(() => output.value.length > 0)

function parse() {
  copied.value = false
  const result = mode.value === 'cookie'
    ? parseCookieHeader(input.value)
    : parseSetCookieHeader(input.value)
  output.value = JSON.stringify(result, null, 2)
  meta.value = mode.value
  liveMessage.value = 'Cookie 已解析'
}

function useSample() {
  input.value = 'sid=abc; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600'
  mode.value = 'set-cookie'
  output.value = ''
  copied.value = false
  meta.value = 'Cookie / Set-Cookie'
  liveMessage.value = 'Cookie 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  copied.value = false
  meta.value = 'Cookie / Set-Cookie'
  liveMessage.value = 'Cookie 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  const clipboardResult = await copyToClipboard(output.value)
  if (!clipboardResult.ok) {
    liveMessage.value = clipboardResult.message
    return
  }
  copied.value = true
  liveMessage.value = 'Cookie 解析结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Cookie 解析器" description="解析 Cookie 请求头或 Set-Cookie 响应头，并展开属性。" :meta="meta">
      <template #icon>
        <Cookie class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4">
        <label class="grid max-w-xs gap-1 text-sm font-medium text-foreground">
          Header 类型
          <select v-model="mode" aria-label="Cookie header 类型" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="cookie">Cookie</option>
            <option value="set-cookie">Set-Cookie</option>
          </select>
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="parse">
            解析 Cookie
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="ghost" @click="useSample">
            <RotateCcw class="h-4 w-4" />
            示例
          </Button>
          <Button type="button" variant="ghost" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopy" @click="copyOutput">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制 JSON
          </Button>
        </template>
      </ToolActionBar>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="Cookie Header" ariaLabel="Cookie 解析输入" placeholder="sid=abc; Path=/; HttpOnly" min-height-class="min-h-[20rem]" />
      <ToolTextareaPanel v-model="output" label="解析结果" ariaLabel="Cookie 解析输出" readonly placeholder="点击解析 Cookie" min-height-class="min-h-[20rem]" empty-message="Cookie 名称、值和属性会显示在这里。" />
    </div>
  </section>
</template>
