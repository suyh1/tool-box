<script setup lang="ts">
import { Check, Clipboard, Database, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseMongoObjectId } from './mongo-objectid'
import { copyToClipboard } from '@/lib/clipboard'

const input = ref('507f1f77bcf86cd799439011')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('ObjectId')

const canCopy = computed(() => output.value.length > 0)

function parse() {
  errorMessage.value = ''
  copied.value = false
  const result = parseMongoObjectId(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = result.timestamp
  liveMessage.value = 'Mongo ObjectId 已解析'
}

function useSample() {
  input.value = '507f1f77bcf86cd799439011'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'ObjectId'
  liveMessage.value = 'Mongo ObjectId 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'ObjectId'
  liveMessage.value = 'Mongo ObjectId 工作区已清空'
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
  liveMessage.value = 'Mongo ObjectId 结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="Mongo ObjectId 解析" description="解析 24 位 Mongo ObjectId 中的时间戳、随机值和计数器字段。" :meta="meta">
      <template #icon>
        <Database class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4">
        <Input v-model="input" aria-label="Mongo ObjectId" placeholder="507f1f77bcf86cd799439011" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="parse">
            解析 ObjectId
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

    <ToolTextareaPanel v-model="output" label="解析结果" ariaLabel="Mongo ObjectId 解析结果" readonly placeholder="点击解析 ObjectId" min-height-class="min-h-[18rem]" empty-message="时间戳、随机值和计数器会显示在这里。" />
  </section>
</template>
