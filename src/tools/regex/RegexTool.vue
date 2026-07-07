<script setup lang="ts">
import { Check, Clipboard, Play, Regex as RegexIcon, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { testRegex, type RegexMatch, type RegexResult } from './regex'
import { copyToClipboard } from '@/lib/clipboard'

const samplePattern = '(?<key>[a-z]+)=(\\d+)'
const sampleText = 'port=443\nhost=8080\nmode=dev'

const pattern = ref('')
const flags = ref('g')
const text = ref('')
const result = ref<RegexResult | null>(null)
const copied = ref(false)
const liveMessage = ref('')

const matches = computed<RegexMatch[]>(() => result.value?.ok ? result.value.matches : [])
const errorMessage = computed(() => result.value && !result.value.ok ? result.value.message : '')
const hasSuccessfulResult = computed(() => result.value?.ok === true)
const resultLabel = computed(() => {
  if (!result.value) {
    return '等待测试'
  }

  if (!result.value.ok) {
    return '正则无效'
  }

  return `${result.value.matches.length} 个匹配`
})

const copyText = computed(() => matches.value.map(formatMatch).join('\n\n'))

function runTest() {
  result.value = testRegex(pattern.value, flags.value, text.value)
  copied.value = false

  if (!result.value.ok) {
    liveMessage.value = result.value.message
    return
  }

  liveMessage.value = result.value.matches.length > 0
    ? `找到 ${result.value.matches.length} 个匹配`
    : '没有匹配结果'
}

function useSample() {
  pattern.value = samplePattern
  flags.value = 'g'
  text.value = sampleText
  result.value = null
  copied.value = false
  liveMessage.value = '正则示例已载入'
}

function clearAll() {
  pattern.value = ''
  flags.value = 'g'
  text.value = ''
  result.value = null
  copied.value = false
  liveMessage.value = '正则工作区已清空'
}

function hasNamedGroups(match: RegexMatch) {
  return Object.keys(match.namedGroups).length > 0
}

function formatMatch(match: RegexMatch, index: number) {
  const lines = [`#${index + 1} @ ${match.index}: ${match.value}`]

  if (match.groups.length > 0) {
    lines.push(`groups: ${match.groups.join(', ')}`)
  }

  if (hasNamedGroups(match)) {
    lines.push(`named: ${JSON.stringify(match.namedGroups)}`)
  }

  return lines.join('\n')
}

async function copyMatches() {
  if (!copyText.value) {
    return
  }

  const clipboardResult = await copyToClipboard(copyText.value)
  if (!clipboardResult.ok) {
    liveMessage.value = clipboardResult.message
    return
  }
  copied.value = true
  liveMessage.value = '正则匹配结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="正则测试"
      description="在本地编译正则表达式，查看匹配位置、捕获组和命名捕获组。"
      :meta="resultLabel"
    >
      <template #icon>
        <RegexIcon class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem]">
        <label class="grid gap-2">
          <span class="text-sm font-medium text-foreground">Pattern</span>
          <Input
            v-model="pattern"
            aria-label="正则表达式"
            placeholder="(?<key>[a-z]+)=(\\d+)"
            class="h-9 font-mono"
            @keyup.enter="runTest"
          />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-foreground">Flags</span>
          <Input
            v-model="flags"
            aria-label="正则标志"
            placeholder="gim"
            class="h-9 font-mono"
            @keyup.enter="runTest"
          />
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="runTest">
            <Play class="h-4 w-4" />
            测试正则
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
          <Button type="button" variant="outline" :disabled="!copyText" @click="copyMatches">
            <Check v-if="copied" class="h-4 w-4" />
            <Clipboard v-else class="h-4 w-4" />
            复制匹配
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
        v-model="text"
        label="测试文本"
        ariaLabel="正则测试文本"
        placeholder="port=443"
        min-height-class="min-h-[24rem]"
        empty-message="粘贴需要测试的文本。工具会在本地显示匹配位置和捕获组。"
      />

      <div class="tool-field grid gap-2 rounded-lg border border-border bg-card p-4">
        <span class="text-sm font-medium text-foreground">匹配结果</span>
        <div class="min-h-[24rem] overflow-auto rounded-md border border-border bg-background/70 p-3">
          <p v-if="!result" class="text-sm leading-6 text-muted-foreground">
            填写 Pattern 和测试文本，然后点击测试正则。匹配、捕获组和命名捕获组会显示在这里。
          </p>
          <p v-else-if="hasSuccessfulResult && matches.length === 0" class="text-sm text-muted-foreground">
            没有匹配结果
          </p>
          <div v-else-if="hasSuccessfulResult" class="grid gap-3">
            <div
              v-for="(match, index) in matches"
              :key="`${match.index}-${index}-${match.value}`"
              class="rounded-md border border-border bg-card/80 p-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="font-mono text-sm text-foreground">#{{ index + 1 }} {{ match.value }}</p>
                <Badge variant="secondary">index {{ match.index }}</Badge>
              </div>
              <div v-if="match.groups.length > 0" class="mt-2 grid gap-1 text-xs text-muted-foreground">
                <p v-for="(group, groupIndex) in match.groups" :key="groupIndex">
                  group {{ groupIndex + 1 }}:
                  <code class="font-mono text-foreground">{{ group }}</code>
                </p>
              </div>
              <div v-if="hasNamedGroups(match)" class="mt-2 grid gap-1 text-xs text-muted-foreground">
                <p v-for="(value, name) in match.namedGroups" :key="name">
                  {{ name }}:
                  <code class="font-mono text-foreground">{{ value }}</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
