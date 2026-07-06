<script setup lang="ts">
import { Check, Clipboard, Regex, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { buildRegexFromPreset, explainRegex } from './regex-helper'

const pattern = ref('^(?<name>[A-Z][a-z]+)\\s+\\d{2,4}$')
const preset = ref('email')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('Explain / preset')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function explain() {
  resetFeedback()
  const result = explainRegex(pattern.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result.items, null, 2)
  meta.value = `${result.items.length} tokens`
  liveMessage.value = '正则解释已生成'
}

function applyPreset() {
  resetFeedback()
  const result = buildRegexFromPreset(preset.value)

  if (!result.ok) {
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  pattern.value = result.pattern
  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.flags} flags`
  liveMessage.value = '正则预设已载入'
}

function useSample() {
  pattern.value = '^(?<name>[A-Z][a-z]+)\\s+\\d{2,4}$'
  preset.value = 'email'
  output.value = ''
  resetFeedback()
  meta.value = 'Explain / preset'
  liveMessage.value = '正则辅助示例已载入'
}

function clearAll() {
  pattern.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'Explain / preset'
  liveMessage.value = '正则辅助工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '正则辅助输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="正则解释 / 生成辅助" description="解释常见正则 token，或从常用预设生成可复制的表达式。" :meta="meta">
      <template #icon>
        <Regex class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          正则表达式
          <Input v-model="pattern" aria-label="正则表达式" placeholder="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}" />
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          预设
          <select v-model="preset" aria-label="正则预设" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="email">Email</option>
            <option value="url">URL</option>
            <option value="uuid">UUID</option>
            <option value="ipv4">IPv4</option>
          </select>
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!pattern" @click="explain">
            解释正则
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" @click="applyPreset">
            使用预设
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
      label="解释 / 预设输出"
      ariaLabel="正则解释或预设输出"
      readonly
      placeholder="点击解释正则或使用预设"
      min-height-class="min-h-[22rem]"
      empty-message="正则 token 说明或预设 pattern 会显示在这里。"
    />
  </section>
</template>
