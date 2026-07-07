<script setup lang="ts">
import { Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from './ToolActionBar.vue'
import ToolAnnouncer from './ToolAnnouncer.vue'
import ToolPanel from './ToolPanel.vue'
import ToolTextareaPanel from './ToolTextareaPanel.vue'
import { copyToClipboard } from '@/lib/clipboard'

type ActionResult = {
  ok: true
  value: string
  meta?: string
} | {
  ok: false
  message: string
}

const props = defineProps<{
  title: string
  description: string
  inputLabel: string
  outputLabel: string
  inputAriaLabel: string
  outputAriaLabel: string
  placeholder?: string
  inputEmptyMessage?: string
  outputEmptyMessage?: string
  sample: string
  actions: Array<{
    label: string
    run: (input: string) => ActionResult
  }>
}>()

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const meta = ref('就绪')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)
const primaryAction = computed(() => props.actions[0])
const secondaryActions = computed(() => props.actions.slice(1))

function runAction(action: (input: string) => ActionResult) {
  errorMessage.value = ''
  copied.value = false

  const result = action(input.value)

  if (!result.ok) {
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = result.meta ?? '已完成'
  liveMessage.value = meta.value
}

function useSample() {
  input.value = props.sample
  output.value = ''
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
  liveMessage.value = '示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  meta.value = '就绪'
  copied.value = false
  liveMessage.value = '已清空'
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
  liveMessage.value = '输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel :title="title" :description="description" :meta="meta">
      <ToolActionBar>
        <template #primary>
          <Button
            v-if="primaryAction"
            type="button"
            @click="runAction(primaryAction.run)"
          >
            {{ primaryAction.label }}
          </Button>
        </template>

        <template #secondary>
          <Button
            v-for="action in secondaryActions"
            :key="action.label"
            type="button"
            variant="secondary"
            @click="runAction(action.run)"
          >
            {{ action.label }}
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
        :label="inputLabel"
        :ariaLabel="inputAriaLabel"
        :placeholder="placeholder"
        :empty-message="inputEmptyMessage"
      />

      <ToolTextareaPanel
        v-model="output"
        :label="outputLabel"
        :ariaLabel="outputAriaLabel"
        readonly
        placeholder="执行操作后查看输出"
        :empty-message="outputEmptyMessage ?? '执行后，结果会显示在这里并保留在本机浏览器。'"
      />
    </div>
  </section>
</template>
