<script setup lang="ts">
import { Check, Clipboard, CodeXml, Play, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { queryXPath, type XPathMatch } from './xml-xpath'

const sampleXml = '<root><item id="1">Ada</item><item id="2">Bob</item></root>'

const input = ref('')
const expression = ref('//item/text()')
const output = ref('')
const matches = ref<XPathMatch[]>([])
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => matches.value.length > 0 ? `${matches.value.length} 个匹配` : '等待 XPath')

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function runQuery() {
  resetFeedback()

  try {
    const result = queryXPath(input.value, expression.value)

    matches.value = result.matches
    output.value = result.output
    liveMessage.value = result.matches.length > 0 ? `找到 ${result.matches.length} 个匹配` : '没有匹配结果'
  } catch (error) {
    const message = error instanceof Error ? error.message : 'XPath 查询失败'

    errorMessage.value = message
    liveMessage.value = message
  }
}

function useSample() {
  input.value = sampleXml
  expression.value = '//item/text()'
  output.value = ''
  matches.value = []
  resetFeedback()
  liveMessage.value = 'XPath 示例已载入'
}

function clearAll() {
  input.value = ''
  expression.value = '//item'
  output.value = ''
  matches.value = []
  resetFeedback()
  liveMessage.value = 'XPath 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'XPath 结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="XML 校验 / XPath 测试"
      description="校验 XML 后执行 XPath，查看元素、属性和文本节点的匹配结果。"
      :meta="metaLabel"
    >
      <template #icon>
        <CodeXml class="h-4 w-4 text-primary" />
      </template>

      <label class="mt-4 grid gap-2">
        <span class="text-sm font-medium text-foreground">XPath</span>
        <Input
          v-model="expression"
          aria-label="XPath 表达式"
          placeholder="//item/text()"
          class="h-9 font-mono"
          @keyup.enter="runQuery"
        />
      </label>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input || !expression" @click="runQuery">
            <Play class="h-4 w-4" />
            测试 XPath
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
        label="XML 输入"
        ariaLabel="XPath XML 输入"
        placeholder="<root><item>Ada</item></root>"
        min-height-class="min-h-[24rem]"
        empty-message="粘贴 XML 后输入 XPath 表达式。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="匹配结果"
        ariaLabel="XPath 查询输出"
        readonly
        placeholder="查询后显示匹配结果"
        min-height-class="min-h-[24rem]"
        empty-message="结果以 JSON 数组列出，包含节点类型和值。"
      />
    </div>

    <section class="tool-field grid gap-3 rounded-lg border border-border bg-card p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-sm font-medium text-foreground">节点预览</h3>
        <Badge variant="secondary">{{ matches.length }} 条</Badge>
      </div>
      <div class="grid gap-2">
        <p v-if="matches.length === 0" class="text-sm leading-6 text-muted-foreground">
          查询后这里会显示命中的节点类型和值。
        </p>
        <template v-else>
          <div
            v-for="(match, index) in matches"
            :key="`${index}-${match.value}`"
            class="rounded-md border border-border bg-background/70 p-3"
          >
            <Badge variant="outline">{{ match.kind }}</Badge>
            <pre class="mt-2 overflow-auto whitespace-pre-wrap font-mono text-sm text-foreground">{{ match.value }}</pre>
          </div>
        </template>
      </div>
    </section>
  </section>
</template>
