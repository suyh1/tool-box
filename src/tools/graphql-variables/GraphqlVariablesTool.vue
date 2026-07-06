<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { checkGraphqlVariables } from './graphql-variables'

const query = ref('query GetUser($id: ID!, $limit: Int) { user(id: $id) { posts(limit: $limit) { title } } }')
const variables = ref('{"limit":10,"extra":true}')
const output = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('variables')

const canCopy = computed(() => output.value.length > 0)

function check() {
  copied.value = false
  const result = checkGraphqlVariables(query.value, variables.value)
  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.missingRequired.length} missing`
  liveMessage.value = 'GraphQL variables 已检查'
}

function useSample() {
  query.value = 'query GetUser($id: ID!, $limit: Int) { user(id: $id) { posts(limit: $limit) { title } } }'
  variables.value = '{"limit":10,"extra":true}'
  output.value = ''
  copied.value = false
  meta.value = 'variables'
  liveMessage.value = 'GraphQL variables 示例已载入'
}

function clearAll() {
  query.value = ''
  variables.value = ''
  output.value = ''
  copied.value = false
  meta.value = 'variables'
  liveMessage.value = 'GraphQL variables 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'GraphQL variables 检查结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="GraphQL Variables 合并检查" description="对比 GraphQL 操作定义和 variables JSON，找出缺失必填变量与未使用变量。" :meta="meta">
      <template #icon>
        <FileText class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="check">
            检查 Variables
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
            复制结果
          </Button>
        </template>
      </ToolActionBar>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-3">
      <ToolTextareaPanel v-model="query" label="GraphQL Query" ariaLabel="GraphQL Variables Query 输入" placeholder="query Get($id: ID!) { ... }" min-height-class="min-h-[24rem]" />
      <ToolTextareaPanel v-model="variables" label="Variables JSON" ariaLabel="GraphQL Variables JSON 输入" placeholder='{"id":"1"}' min-height-class="min-h-[24rem]" />
      <ToolTextareaPanel v-model="output" label="检查结果" ariaLabel="GraphQL Variables 检查结果" readonly placeholder="点击检查 Variables" min-height-class="min-h-[24rem]" empty-message="变量定义、已提供变量、缺失项和未使用项会显示在这里。" />
    </div>
  </section>
</template>
