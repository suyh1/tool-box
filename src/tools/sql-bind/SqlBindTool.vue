<script setup lang="ts">
import { Check, Clipboard, Database, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { previewSqlBindings } from './sql-bind'
import { copyToClipboard } from '@/lib/clipboard'

const sql = ref('select * from users where id = ? and name = ?')
const params = ref(`[1,"Ada O'Neil"]`)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('positional ?')

const canCopy = computed(() => output.value.length > 0)

function preview() {
  errorMessage.value = ''
  copied.value = false
  const result = previewSqlBindings(sql.value, params.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.sql
  meta.value = `${result.consumed} bound`
  liveMessage.value = 'SQL 参数绑定预览已生成'
}

function useSample() {
  sql.value = 'select * from users where id = ? and name = ?'
  params.value = `[1,"Ada O'Neil"]`
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'positional ?'
  liveMessage.value = 'SQL 参数示例已载入'
}

function clearAll() {
  sql.value = ''
  params.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'positional ?'
  liveMessage.value = 'SQL 参数工作区已清空'
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
  liveMessage.value = 'SQL 预览已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="SQL 参数绑定预览" description="用 JSON 数组替换 SQL 中的 ? 占位符，生成便于排查的可读 SQL 预览。" :meta="meta">
      <template #icon>
        <Database class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="preview">
            预览绑定
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
            复制 SQL
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-3">
      <ToolTextareaPanel v-model="sql" label="SQL" ariaLabel="SQL 参数绑定输入 SQL" placeholder="select * from table where id = ?" min-height-class="min-h-[22rem]" />
      <ToolTextareaPanel v-model="params" label="参数 JSON 数组" ariaLabel="SQL 参数 JSON 数组" placeholder="[1, &quot;Ada&quot;]" min-height-class="min-h-[22rem]" />
      <ToolTextareaPanel v-model="output" label="绑定预览" ariaLabel="SQL 参数绑定输出" readonly placeholder="点击预览绑定" min-height-class="min-h-[22rem]" empty-message="替换占位符后的 SQL 会显示在这里。" />
    </div>
  </section>
</template>
