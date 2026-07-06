<script setup lang="ts">
import { Check, Clipboard, Database, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatRedisCommand } from './redis-command'

const input = ref('SET user:1 "Ada Lovelace"')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('RESP')

const canCopy = computed(() => output.value.length > 0)

function format() {
  errorMessage.value = ''
  copied.value = false
  const result = formatRedisCommand(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.tokens.length} tokens`
  liveMessage.value = 'Redis 命令已格式化'
}

function useSample() {
  input.value = 'SET user:1 "Ada Lovelace"'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'RESP'
  liveMessage.value = 'Redis 命令示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'RESP'
  liveMessage.value = 'Redis 命令工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'Redis 命令结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Redis 命令格式化" description="把 Redis 命令切分为 token，并生成 RESP 协议预览。" :meta="meta">
      <template #icon>
        <Database class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="format">
            格式化 Redis
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

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="Redis 命令" ariaLabel="Redis 命令输入" placeholder='SET user:1 "Ada Lovelace"' min-height-class="min-h-[18rem]" />
      <ToolTextareaPanel v-model="output" label="RESP 预览" ariaLabel="Redis 命令 RESP 输出" readonly placeholder="点击格式化 Redis" min-height-class="min-h-[18rem]" empty-message="Token 和 RESP 协议预览会显示在这里。" />
    </div>
  </section>
</template>
