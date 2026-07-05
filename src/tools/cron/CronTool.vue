<script setup lang="ts">
import { Check, Clipboard, Clock3, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { getNextCronRuns } from './cron'

const input = ref('')
const output = ref('')
const fromValue = ref(toDateTimeLocalValue(new Date()))
const errorMessage = ref('')
const meta = ref('等待表达式')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)

function toDateTimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join('T')
}

function parseLocalDateTime(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? new Date() : date
}

function runCron() {
  errorMessage.value = ''
  copied.value = false

  const result = getNextCronRuns(input.value, parseLocalDateTime(fromValue.value), 5)

  if (!result.ok) {
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value.join('\n')
  meta.value = result.meta
  liveMessage.value = result.meta
}

function useSample() {
  input.value = '*/15 9-18 * * MON-FRI'
  output.value = ''
  fromValue.value = toDateTimeLocalValue(new Date())
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
  liveMessage.value = 'Cron 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  fromValue.value = toDateTimeLocalValue(new Date())
  errorMessage.value = ''
  meta.value = '等待表达式'
  copied.value = false
  liveMessage.value = 'Cron 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'Cron 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="Cron 表达式解析"
      description="解析标准 5 字段 Cron 表达式，并计算从指定时间开始的下一批执行时间。"
      :meta="meta"
    >
      <template #icon>
        <Clock3 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="runCron">
            计算执行时间
          </Button>
        </template>

        <template #secondary>
          <label class="sr-only" for="cron-from">起始时间</label>
          <input
            id="cron-from"
            v-model="fromValue"
            type="datetime-local"
            aria-label="Cron 起始时间"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
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
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="Cron 输入"
        ariaLabel="Cron 表达式输入"
        placeholder="*/15 9-18 * * MON-FRI"
        empty-message="输入 minute hour day-of-month month day-of-week 五个字段。支持 *, ranges, steps, lists 和英文别名。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="下一次执行"
        ariaLabel="Cron 执行时间输出"
        readonly
        placeholder="点击计算后查看执行时间"
        empty-message="下一批执行时间会按 YYYY-MM-DD HH:mm 输出。"
      />
    </div>
  </section>
</template>
