<script setup lang="ts">
import { Check, Clipboard, Monitor, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseUserAgent } from './user-agent'
import { copyToClipboard } from '@/lib/clipboard'

const sample = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
const input = ref(sample)
const output = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('browser / OS')

const canCopy = computed(() => output.value.length > 0)

function parse() {
  copied.value = false
  const result = parseUserAgent(input.value)
  output.value = JSON.stringify(result, null, 2)
  meta.value = result.browser.name
  liveMessage.value = 'User-Agent 已解析'
}

function useSample() {
  input.value = sample
  output.value = ''
  copied.value = false
  meta.value = 'browser / OS'
  liveMessage.value = 'User-Agent 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  copied.value = false
  meta.value = 'browser / OS'
  liveMessage.value = 'User-Agent 工作区已清空'
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
  liveMessage.value = 'User-Agent 结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="User-Agent 解析器" description="解析常见浏览器 User-Agent 的浏览器、引擎、系统和设备类型。" :meta="meta">
      <template #icon>
        <Monitor class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="parse">
            解析 UA
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
      <ToolTextareaPanel v-model="input" label="User-Agent" ariaLabel="User-Agent 输入" placeholder="粘贴 User-Agent" min-height-class="min-h-[20rem]" />
      <ToolTextareaPanel v-model="output" label="解析结果" ariaLabel="User-Agent 输出" readonly placeholder="点击解析 UA" min-height-class="min-h-[20rem]" empty-message="浏览器、系统、引擎和设备信息会显示在这里。" />
    </div>
  </section>
</template>
