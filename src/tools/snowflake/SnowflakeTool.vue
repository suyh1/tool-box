<script setup lang="ts">
import { Check, Clipboard, Hash, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { defaultSnowflakeEpochMs, generateSnowflakeId, parseSnowflakeId } from './snowflake'

const input = ref('')
const output = ref('')
const epochMs = ref(defaultSnowflakeEpochMs)
const workerId = ref(1)
const sequence = ref(0)
const timestampText = ref(new Date().toISOString())
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('Twitter epoch')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function showResult(result: ReturnType<typeof parseSnowflakeId>) {
  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  input.value = result.id
  meta.value = `${result.workerId} / ${result.sequence}`
  liveMessage.value = 'Snowflake ID 已处理'
}

function parseId() {
  resetFeedback()
  showResult(parseSnowflakeId(input.value, { epochMs: epochMs.value }))
}

function generateId() {
  resetFeedback()
  const timestampMs = Date.parse(timestampText.value)

  if (Number.isNaN(timestampMs)) {
    output.value = ''
    errorMessage.value = '时间必须是有效日期字符串。'
    liveMessage.value = errorMessage.value
    return
  }

  showResult(generateSnowflakeId({ timestampMs, workerId: workerId.value, sequence: sequence.value, epochMs: epochMs.value }))
}

function useSample() {
  input.value = '4194304'
  epochMs.value = 0
  workerId.value = 1
  sequence.value = 0
  timestampText.value = '1970-01-01T00:00:00.001Z'
  output.value = ''
  resetFeedback()
  meta.value = 'sample epoch'
  liveMessage.value = 'Snowflake 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'Twitter epoch'
  liveMessage.value = 'Snowflake 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'Snowflake 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Snowflake ID 解析 / 生成" description="解析和生成 Twitter 风格 64 位 Snowflake ID。" :meta="meta">
      <template #icon>
        <Hash class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_10rem]">
        <Input v-model="input" aria-label="Snowflake ID" placeholder="Snowflake ID" />
        <Input v-model.number="epochMs" type="number" aria-label="Snowflake epoch 毫秒" />
        <Input v-model.number="workerId" type="number" min="0" max="1023" aria-label="Worker ID" />
        <Input v-model.number="sequence" type="number" min="0" max="4095" aria-label="序列号" />
      </div>

      <div class="mt-3">
        <Input v-model="timestampText" aria-label="Snowflake 时间" placeholder="2026-07-06T00:00:00.000Z" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="parseId">
            解析 ID
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" @click="generateId">
            生成 ID
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
      ariaLabel="Snowflake 结果"
      readonly
      placeholder="解析或生成后查看 JSON"
      min-height-class="min-h-[20rem]"
      empty-message="时间、worker、序列号和 ID 会显示在这里。"
    />
  </section>
</template>
