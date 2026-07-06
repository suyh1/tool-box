<script setup lang="ts">
import { Braces, Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatGraphql } from './graphql-format'

const input = ref('query GetUser($id:ID!){user(id:$id){id name posts{title}}}')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('GraphQL')

const canCopy = computed(() => output.value.length > 0)

function format() {
  errorMessage.value = ''
  copied.value = false
  const result = formatGraphql(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.output
  meta.value = `${result.output.split('\n').length} lines`
  liveMessage.value = 'GraphQL 已格式化'
}

function useSample() {
  input.value = 'query GetUser($id:ID!){user(id:$id){id name posts{title}}}'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'GraphQL'
  liveMessage.value = 'GraphQL 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'GraphQL'
  liveMessage.value = 'GraphQL 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'GraphQL 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="GraphQL Formatter" description="格式化常见 GraphQL query、mutation 和 selection set。" :meta="meta">
      <template #icon>
        <Braces class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="format">
            格式化 GraphQL
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
            复制输出
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="input" label="GraphQL 输入" ariaLabel="GraphQL 输入" placeholder="query { viewer { login } }" min-height-class="min-h-[26rem]" />
      <ToolTextareaPanel v-model="output" label="格式化结果" ariaLabel="GraphQL 格式化结果" readonly placeholder="点击格式化 GraphQL" min-height-class="min-h-[26rem]" empty-message="格式化后的 GraphQL 文档会显示在这里。" />
    </div>
  </section>
</template>
