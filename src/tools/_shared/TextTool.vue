<script setup lang="ts">
import { Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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

const canCopy = computed(() => output.value.length > 0)

function runAction(action: (input: string) => ActionResult) {
  errorMessage.value = ''
  copied.value = false

  const result = action(input.value)

  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = result.meta ?? '已完成'
}

function useSample() {
  input.value = props.sample
  output.value = ''
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  meta.value = '就绪'
  copied.value = false
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
}
</script>

<template>
  <section class="grid gap-4">
    <div class="rounded-lg border border-border bg-card p-4 md:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-foreground">{{ title }}</h2>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{{ description }}</p>
        </div>
        <Badge variant="secondary">{{ meta }}</Badge>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <Button
          v-for="action in actions"
          :key="action.label"
          type="button"
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
      </div>

      <p v-if="errorMessage" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">{{ inputLabel }}</span>
        <Textarea
          v-model="input"
          :aria-label="inputAriaLabel"
          spellcheck="false"
          :placeholder="placeholder"
          class="min-h-[20rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>

      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">{{ outputLabel }}</span>
        <Textarea
          v-model="output"
          :aria-label="outputAriaLabel"
          readonly
          spellcheck="false"
          placeholder="执行操作后查看输出"
          class="min-h-[20rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>
    </div>
  </section>
</template>
