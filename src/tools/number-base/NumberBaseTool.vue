<script setup lang="ts">
import { Check, Clipboard, Hash, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertNumberBase, getNumberBaseSummary, type NumberBaseSummary } from './number-base'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('')
const output = ref('')
const fromBase = ref(10)
const toBase = ref(16)
const summary = ref<NumberBaseSummary | null>(null)
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('等待数字')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function convertInput() {
  resetFeedback()
  const result = convertNumberBase(input.value, fromBase.value, toBase.value)

  if (!result.ok) {
    output.value = ''
    summary.value = null
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  const summaryResult = getNumberBaseSummary(input.value, fromBase.value)
  summary.value = summaryResult.ok ? summaryResult.values : null
  meta.value = `${fromBase.value} → ${toBase.value}`
  liveMessage.value = '进制转换完成'
}

function useSample() {
  input.value = '255'
  output.value = ''
  fromBase.value = 10
  toBase.value = 16
  summary.value = null
  resetFeedback()
  meta.value = '示例已载入'
  liveMessage.value = '进制转换示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  summary.value = null
  resetFeedback()
  meta.value = '等待数字'
  liveMessage.value = '进制转换工作区已清空'
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
  liveMessage.value = '进制转换输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="Number Base 转换"
      description="在 2 到 36 进制之间转换整数，并生成常用二/八/十/十六进制摘要。"
      :meta="meta"
    >
      <template #icon>
        <Hash class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="convertInput">
            转换进制
          </Button>
        </template>

        <template #secondary>
          <label class="grid w-24 gap-1 text-sm text-muted-foreground">
            From
            <Input v-model.number="fromBase" aria-label="源进制" type="number" min="2" max="36" />
          </label>
          <label class="grid w-24 gap-1 text-sm text-muted-foreground">
            To
            <Input v-model.number="toBase" aria-label="目标进制" type="number" min="2" max="36" />
          </label>
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
            复制输出
          </Button>
        </template>
      </ToolActionBar>

      <p
        v-if="errorMessage"
        role="alert"
        class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {{ errorMessage }}
      </p>

      <dl v-if="summary" class="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">BIN</dt>
          <dd class="mt-1 break-all font-mono text-foreground">{{ summary.binary }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">OCT</dt>
          <dd class="mt-1 break-all font-mono text-foreground">{{ summary.octal }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">DEC</dt>
          <dd class="mt-1 break-all font-mono text-foreground">{{ summary.decimal }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">HEX</dt>
          <dd class="mt-1 break-all font-mono text-foreground">{{ summary.hexadecimal }}</dd>
        </div>
      </dl>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="输入"
        ariaLabel="进制转换输入"
        placeholder="255"
        min-height-class="min-h-[24rem]"
        empty-message="输入整数。支持正负号和下划线分组，源进制范围 2-36。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="输出"
        ariaLabel="进制转换输出"
        readonly
        placeholder="ff"
        min-height-class="min-h-[24rem]"
        empty-message="转换结果会显示在这里。"
      />
    </div>
  </section>
</template>
