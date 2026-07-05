<script setup lang="ts">
import { Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { convertCases, type CaseConversions } from './case'

type CaseKey = keyof CaseConversions

const sample = 'user profile URL_id'
const input = ref('')
const copiedKey = ref<CaseKey | ''>('')

const converted = computed(() => convertCases(input.value))
const wordCount = computed(() => converted.value.snake.split('_').filter(Boolean).length)

const formats: Array<{ key: CaseKey; label: string; hint: string }> = [
  { key: 'camel', label: 'camelCase', hint: 'JavaScript 变量' },
  { key: 'pascal', label: 'PascalCase', hint: '组件和类型' },
  { key: 'snake', label: 'snake_case', hint: '数据库字段' },
  { key: 'kebab', label: 'kebab-case', hint: 'URL 和 CSS 类名' },
  { key: 'constant', label: 'CONSTANT_CASE', hint: '常量' },
  { key: 'title', label: 'Title Case', hint: '标题文本' },
]

function useSample() {
  input.value = sample
  copiedKey.value = ''
}

function clearAll() {
  input.value = ''
  copiedKey.value = ''
}

async function copyValue(key: CaseKey) {
  const value = converted.value[key]

  if (!value) {
    return
  }

  await navigator.clipboard.writeText(value)
  copiedKey.value = key
}
</script>

<template>
  <section class="grid gap-4">
    <div class="rounded-lg border border-border bg-card p-4 md:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-foreground">命名格式转换</h2>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            将自然文本、下划线、短横线或 camelCase 输入转换成常用代码命名格式。
          </p>
        </div>
        <Badge variant="secondary">{{ wordCount > 0 ? `${wordCount} 个词` : '等待输入' }}</Badge>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="ghost" @click="useSample">
          <RotateCcw class="h-4 w-4" />
          示例
        </Button>
        <Button type="button" variant="ghost" @click="clearAll">
          <Trash2 class="h-4 w-4" />
          清空
        </Button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <label class="grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">输入</span>
        <Textarea
          v-model="input"
          aria-label="命名格式输入"
          spellcheck="false"
          placeholder="user profile URL_id"
          class="min-h-[22rem] resize-y border-border bg-background/70 font-mono text-sm leading-6"
        />
      </label>

      <div class="grid gap-3">
        <div
          v-for="item in formats"
          :key="item.key"
          class="grid gap-2 rounded-lg border border-border bg-card p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-foreground">{{ item.label }}</p>
              <p class="mt-0.5 text-xs text-muted-foreground">{{ item.hint }}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              :disabled="!converted[item.key]"
              :aria-label="`复制 ${item.label}`"
              class="h-8 w-8 shrink-0"
              @click="copyValue(item.key)"
            >
              <Check v-if="copiedKey === item.key" class="h-4 w-4" />
              <Clipboard v-else class="h-4 w-4" />
            </Button>
          </div>
          <code class="min-h-8 overflow-x-auto rounded-md bg-background/70 px-3 py-2 font-mono text-sm text-foreground">
            {{ converted[item.key] || '等待输入' }}
          </code>
        </div>
      </div>
    </div>
  </section>
</template>
