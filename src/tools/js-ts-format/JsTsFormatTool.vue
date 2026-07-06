<script setup lang="ts">
import { Check, Clipboard, Code2, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatJavaScriptTypeScript, type ScriptLanguage } from './js-ts-format'

const sampleJavaScript = 'const value={name:"Ada"};function greet(){return value.name}'
const sampleTypeScript = 'type User={id:number;name:string}\nconst user:User={id:1,name:"Ada"}'

const input = ref('')
const output = ref('')
const language = ref<ScriptLanguage>('javascript')
const errorMessage = ref('')
const meta = ref('等待代码')
const copied = ref(false)
const liveMessage = ref('')
const isRunning = ref(false)

const canCopy = computed(() => output.value.length > 0)
const sample = computed(() => language.value === 'typescript' ? sampleTypeScript : sampleJavaScript)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function runFormat() {
  resetFeedback()
  isRunning.value = true

  const result = await formatJavaScriptTypeScript(input.value, {
    language: language.value,
  })

  isRunning.value = false

  if (!result.ok) {
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.value
  meta.value = result.meta
  liveMessage.value = result.meta
}

function useSample() {
  input.value = sample.value
  output.value = ''
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
  liveMessage.value = '脚本格式化示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  meta.value = '等待代码'
  copied.value = false
  liveMessage.value = '脚本格式化工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '脚本输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="JavaScript / TypeScript 格式化"
      description="本地格式化 JavaScript 和 TypeScript 源码，不执行输入内容。"
      :meta="meta"
    >
      <template #icon>
        <Code2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input || isRunning" @click="runFormat">
            <Sparkles class="h-4 w-4" />
            格式化代码
          </Button>
        </template>

        <template #secondary>
          <label class="flex min-w-[12rem] items-center gap-2 text-sm text-muted-foreground">
            语言
            <select
              v-model="language"
              class="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="脚本语言"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
            </select>
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
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="代码输入"
        ariaLabel="JavaScript TypeScript 输入"
        :placeholder="sample"
        min-height-class="min-h-[30rem]"
        empty-message="粘贴 JavaScript 或 TypeScript 代码。选择语言后使用对应解析器格式化。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="代码输出"
        ariaLabel="JavaScript TypeScript 输出"
        readonly
        placeholder="执行格式化后查看输出"
        min-height-class="min-h-[30rem]"
        empty-message="格式化后的代码会显示在这里。"
      />
    </div>
  </section>
</template>
