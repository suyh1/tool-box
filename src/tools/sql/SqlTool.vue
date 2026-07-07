<script setup lang="ts">
import { Check, Clipboard, Database, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatSql, minifySql } from './sql'
import { copyToClipboard } from '@/lib/clipboard'

const sampleSql = 'select id,name,email from users where active=1 order by created_at desc'

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const meta = ref('等待 SQL')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)

function runAction(action: 'format' | 'minify') {
  errorMessage.value = ''
  copied.value = false

  const result = action === 'format' ? formatSql(input.value) : minifySql(input.value)

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
  input.value = sampleSql
  output.value = ''
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
  liveMessage.value = 'SQL 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  meta.value = '等待 SQL'
  copied.value = false
  liveMessage.value = 'SQL 工作区已清空'
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
  liveMessage.value = 'SQL 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="SQL 格式化"
      description="格式化 SQL 查询或压缩 SQL 片段，适合整理日志、脚本和调试语句。"
      :meta="meta"
    >
      <template #icon>
        <Database class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="runAction('format')">
            格式化 SQL
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" @click="runAction('minify')">
            压缩 SQL
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
        label="SQL 输入"
        ariaLabel="SQL 输入"
        :placeholder="sampleSql"
        min-height-class="min-h-[22rem]"
        empty-message="粘贴 SQL 查询、日志中的 SQL 或脚本片段。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="SQL 输出"
        ariaLabel="SQL 输出"
        readonly
        placeholder="执行操作后查看输出"
        min-height-class="min-h-[22rem]"
        empty-message="格式化或压缩后的 SQL 会显示在这里。"
      />
    </div>
  </section>
</template>
