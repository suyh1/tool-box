<script setup lang="ts">
import { Check, Clipboard, Hash, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateUlid, parseUlid } from './ulid'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('')
const output = ref('')
const timestampText = ref(new Date().toISOString())
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('sortable')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function showResult(result: ReturnType<typeof parseUlid>) {
  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  input.value = result.ulid
  output.value = JSON.stringify(result, null, 2)
  meta.value = result.dateTime
  liveMessage.value = 'ULID 已处理'
}

function generateOne() {
  resetFeedback()
  const timestampMs = Date.parse(timestampText.value)

  if (Number.isNaN(timestampMs)) {
    output.value = ''
    errorMessage.value = '时间必须是有效日期字符串。'
    liveMessage.value = errorMessage.value
    return
  }

  showResult(generateUlid({ timestampMs }))
}

function parseOne() {
  resetFeedback()
  showResult(parseUlid(input.value))
}

function useSample() {
  input.value = '00000000010000000000000000'
  timestampText.value = '1970-01-01T00:00:00.001Z'
  output.value = ''
  resetFeedback()
  meta.value = 'sample'
  liveMessage.value = 'ULID 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'sortable'
  liveMessage.value = 'ULID 工作区已清空'
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
  liveMessage.value = 'ULID 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="ULID 生成" description="生成可按时间排序的 ULID，并解析其中的时间戳。" :meta="meta">
      <template #icon>
        <Hash class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 lg:grid-cols-2">
        <Input v-model="input" aria-label="ULID" placeholder="ULID" />
        <Input v-model="timestampText" aria-label="ULID 时间" placeholder="2026-07-06T00:00:00.000Z" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="generateOne">
            生成 ULID
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="parseOne">
            解析时间
          </Button>
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

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel
      v-model="output"
      label="结果"
      ariaLabel="ULID 结果"
      readonly
      placeholder="生成或解析后查看 JSON"
      min-height-class="min-h-[18rem]"
      empty-message="ULID 和解析出的时间戳会显示在这里。"
    />
  </section>
</template>
