<script setup lang="ts">
import { Check, Clipboard, Network, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertIpv4 } from './ip-convert'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('192.168.1.10')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('IPv4 forms')

const canCopy = computed(() => output.value.length > 0)

function convert() {
  errorMessage.value = ''
  copied.value = false
  const result = convertIpv4(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = result.hex
  liveMessage.value = 'IP 表示已转换'
}

function useSample() {
  input.value = '192.168.1.10'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'IPv4 forms'
  liveMessage.value = 'IP 转换示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'IPv4 forms'
  liveMessage.value = 'IP 转换工作区已清空'
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
  liveMessage.value = 'IP 转换结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="IPv4 / IPv6 转换" description="把 IPv4 转换为整数、HEX、二进制和 IPv4-mapped IPv6 表示。" :meta="meta">
      <template #icon>
        <Network class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4">
        <Input v-model="input" aria-label="IPv4 地址" placeholder="192.168.1.10" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="convert">
            转换 IP
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

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel v-model="output" label="转换结果" ariaLabel="IP 转换结果" readonly placeholder="点击转换 IP" min-height-class="min-h-[20rem]" empty-message="整数、HEX、二进制和 IPv6 mapped 地址会显示在这里。" />
  </section>
</template>
