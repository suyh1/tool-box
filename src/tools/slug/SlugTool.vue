<script setup lang="ts">
import { Check, Clipboard, Link, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generateSlug } from './slug'

const input = ref('Crème Brûlée & Vue Tools')
const output = ref('')
const separator = ref<'-' | '_'>('-')
const lowercase = ref(true)
const maxLength = ref(80)
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('URL-safe')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  copied.value = false
}

function run() {
  resetFeedback()
  output.value = generateSlug(input.value, {
    separator: separator.value,
    lowercase: lowercase.value,
    maxLength: maxLength.value,
  })
  meta.value = `${output.value.length} chars`
  liveMessage.value = 'Slug 已生成'
}

function useSample() {
  input.value = 'Crème Brûlée & Vue Tools'
  output.value = ''
  separator.value = '-'
  lowercase.value = true
  maxLength.value = 80
  resetFeedback()
  meta.value = 'URL-safe'
  liveMessage.value = 'Slug 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'URL-safe'
  liveMessage.value = 'Slug 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'Slug 已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Slug 生成" description="把标题或文件名转换为 URL 安全 slug，支持分隔符、大小写和长度限制。" :meta="meta">
      <template #icon>
        <Link class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 md:grid-cols-[10rem_10rem_minmax(0,1fr)]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          分隔符
          <select v-model="separator" aria-label="Slug 分隔符" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="-">-</option>
            <option value="_">_</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          最大长度
          <Input v-model.number="maxLength" type="number" min="0" step="1" aria-label="Slug 最大长度" />
        </label>
        <label class="flex items-center gap-2 rounded-md border border-border bg-background/55 px-3 py-2 text-sm text-foreground">
          <input v-model="lowercase" type="checkbox" class="h-4 w-4 accent-primary">
          转小写
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="run">
            生成 Slug
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
            复制 Slug
          </Button>
        </template>
      </ToolActionBar>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="输入文本" ariaLabel="Slug 输入文本" placeholder="粘贴标题、文件名或路径片段" min-height-class="min-h-[14rem]" />
      <ToolTextareaPanel v-model="output" label="Slug" ariaLabel="Slug 输出" readonly placeholder="点击生成 Slug" min-height-class="min-h-[14rem]" empty-message="生成的 URL-safe slug 会显示在这里。" />
    </div>
  </section>
</template>
