<script setup lang="ts">
import { Check, Clipboard, Network, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { inspectMacAddress } from './mac-address'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('00-16-3E-AA-BB-CC')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('OUI lookup')

const canCopy = computed(() => output.value.length > 0)

function inspect() {
  errorMessage.value = ''
  copied.value = false
  const result = inspectMacAddress(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = result.vendor
  liveMessage.value = 'MAC 地址已解析'
}

function useSample() {
  input.value = '00-16-3E-AA-BB-CC'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'OUI lookup'
  liveMessage.value = 'MAC 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'OUI lookup'
  liveMessage.value = 'MAC 工作区已清空'
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
  liveMessage.value = 'MAC 结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="MAC 地址格式化 / 厂商查询" description="规范化 MAC 地址，输出冒号、连字符、纯 HEX 格式，并通过内置 OUI 小表查询厂商。" :meta="meta">
      <template #icon>
        <Network class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4">
        <Input v-model="input" aria-label="MAC 地址" placeholder="00-16-3E-AA-BB-CC" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="inspect">
            解析 MAC
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

    <ToolTextareaPanel v-model="output" label="解析结果" ariaLabel="MAC 地址解析结果" readonly placeholder="点击解析 MAC" min-height-class="min-h-[20rem]" empty-message="格式化结果、OUI 和本地厂商匹配会显示在这里。" />
  </section>
</template>
