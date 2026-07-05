<script setup lang="ts">
import { CaseSensitive, Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertCases, type CaseConversions } from './case'

type CaseKey = keyof CaseConversions

const sample = 'user profile URL_id'
const input = ref('')
const copiedKey = ref<CaseKey | ''>('')
const liveMessage = ref('')

const converted = computed(() => convertCases(input.value))
const wordCount = computed(() => converted.value.snake.split('_').filter(Boolean).length)
const metaLabel = computed(() => wordCount.value > 0 ? `${wordCount.value} 个词` : '等待输入')

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
  liveMessage.value = '命名示例已载入'
}

function clearAll() {
  input.value = ''
  copiedKey.value = ''
  liveMessage.value = '命名工作区已清空'
}

async function copyValue(key: CaseKey) {
  const value = converted.value[key]

  if (!value) {
    return
  }

  await navigator.clipboard.writeText(value)
  copiedKey.value = key
  liveMessage.value = `${formats.find((item) => item.key === key)?.label ?? '结果'} 已复制`
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="命名格式转换"
      description="将自然文本、下划线、短横线或 camelCase 输入实时转换成常用代码命名格式。"
      :meta="metaLabel"
    >
      <template #icon>
        <CaseSensitive class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!converted.camel" @click="copyValue('camel')">
            <Check v-if="copiedKey === 'camel'" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制 camelCase
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
        </template>
      </ToolActionBar>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ToolTextareaPanel
        v-model="input"
        label="输入"
        ariaLabel="命名格式输入"
        placeholder="user profile URL_id"
        min-height-class="min-h-[22rem]"
        empty-message="输入变量名、短语或路径片段，右侧会实时生成常用命名格式。"
      />

      <div class="grid gap-3">
        <div
          v-if="!input"
          class="tool-field rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground"
        >
          结果会随输入实时更新。常用格式可以逐项复制，不需要离开键盘工作流。
        </div>

        <div
          v-for="item in formats"
          :key="item.key"
          class="tool-field grid gap-2 rounded-lg border border-border bg-card p-4"
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
