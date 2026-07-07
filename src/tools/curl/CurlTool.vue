<script setup lang="ts">
import { Check, Clipboard, Code2, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertCurlToCode, type CurlTarget } from './curl'
import { copyToClipboard } from '@/lib/clipboard'

const targets: Array<{ value: CurlTarget; label: string }> = [
  { value: 'fetch', label: 'Fetch' },
  { value: 'axios', label: 'Axios' },
  { value: 'python', label: 'Python requests' },
]

const sampleCurl = "curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{\"name\":\"Ada\"}' https://api.example.com/users"

const input = ref('')
const output = ref('')
const target = ref<CurlTarget>('fetch')
const errorMessage = ref('')
const meta = ref('等待 cURL')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)

function generateCode() {
  errorMessage.value = ''
  copied.value = false

  const result = convertCurlToCode(input.value, target.value)

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
  input.value = sampleCurl
  output.value = ''
  target.value = 'fetch'
  errorMessage.value = ''
  meta.value = '示例已载入'
  copied.value = false
  liveMessage.value = 'cURL 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  target.value = 'fetch'
  errorMessage.value = ''
  meta.value = '等待 cURL'
  copied.value = false
  liveMessage.value = 'cURL 工作区已清空'
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
  liveMessage.value = 'cURL 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="cURL 转代码"
      description="把常见 cURL 请求转换为 Fetch、Axios 或 Python requests 起手代码。"
      :meta="meta"
    >
      <template #icon>
        <Code2 class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="generateCode">
            生成代码
          </Button>
        </template>

        <template #secondary>
          <label class="sr-only" for="curl-target">输出目标</label>
          <select
            id="curl-target"
            v-model="target"
            aria-label="cURL 输出目标"
            class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option v-for="item in targets" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
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
        label="cURL 输入"
        ariaLabel="cURL 输入"
        :placeholder="sampleCurl"
        min-height-class="min-h-[22rem]"
        empty-message="粘贴 API 文档中的 cURL 命令。支持 method、headers、body、basic auth 和 URL。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="代码输出"
        ariaLabel="cURL 代码输出"
        readonly
        placeholder="点击生成代码后查看输出"
        min-height-class="min-h-[22rem]"
        empty-message="转换后的客户端代码会显示在这里。"
      />
    </div>
  </section>
</template>
