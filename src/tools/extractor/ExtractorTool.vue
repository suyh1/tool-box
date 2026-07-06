<script setup lang="ts">
import { Check, Clipboard, RotateCcw, Search, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { extractEntities } from './extractor'

const input = ref('Email admin@example.com, visit https://example.com/a?b=1 or http://localhost:5173. IPs: 192.168.1.10 and 2001:db8::1')
const output = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('URL / email / IP')

const canCopy = computed(() => output.value.length > 0)

function extract() {
  copied.value = false
  const result = extractEntities(input.value)
  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.total} matches`
  liveMessage.value = `已提取 ${result.total} 个匹配项`
}

function useSample() {
  input.value = 'Email admin@example.com, visit https://example.com/a?b=1 or http://localhost:5173. IPs: 192.168.1.10 and 2001:db8::1'
  output.value = ''
  copied.value = false
  meta.value = 'URL / email / IP'
  liveMessage.value = '提取器示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  copied.value = false
  meta.value = 'URL / email / IP'
  liveMessage.value = '提取器工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '提取结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="提取 URL / 邮箱 / IP" description="从文本中提取 URL、邮箱、IPv4 和 IPv6，并按类型去重输出。" :meta="meta">
      <template #icon>
        <Search class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="extract">
            提取内容
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
      <ToolTextareaPanel v-model="input" label="输入文本" ariaLabel="提取器输入文本" placeholder="粘贴需要提取的文本" min-height-class="min-h-[24rem]" />
      <ToolTextareaPanel v-model="output" label="提取结果" ariaLabel="提取器输出结果" readonly placeholder="点击提取内容" min-height-class="min-h-[24rem]" empty-message="提取到的 URL、邮箱和 IP 会以 JSON 显示在这里。" />
    </div>
  </section>
</template>
