<script setup lang="ts">
import { Check, Clipboard, Database, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseConnectionString } from './connection-string'

const input = ref('postgres://user:pass@localhost:5432/app?sslmode=require')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('Database URL')

const canCopy = computed(() => output.value.length > 0)

function parse() {
  errorMessage.value = ''
  copied.value = false
  const result = parseConnectionString(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = result.scheme
  liveMessage.value = '连接字符串已解析'
}

function useSample() {
  input.value = 'postgres://user:pass@localhost:5432/app?sslmode=require'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'Database URL'
  liveMessage.value = '连接字符串示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'Database URL'
  liveMessage.value = '连接字符串工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '连接字符串结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="连接字符串解析器" description="解析 Postgres、MySQL、Redis、Mongo 等 URL 形态连接字符串，并输出脱敏版本。" :meta="meta">
      <template #icon>
        <Database class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4">
        <Input v-model="input" aria-label="数据库连接字符串" placeholder="postgres://user:pass@localhost:5432/app?sslmode=require" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="parse">
            解析连接字符串
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
            复制 JSON
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel v-model="output" label="解析结果" ariaLabel="连接字符串解析结果" readonly placeholder="点击解析连接字符串" min-height-class="min-h-[22rem]" empty-message="协议、账号、主机、数据库、参数和脱敏 URL 会显示在这里。" />
  </section>
</template>
