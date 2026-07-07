<script setup lang="ts">
import { Check, Clipboard, CodeXml, RotateCcw, Sparkles, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { formatSitemap, validateSitemap, type SitemapSummary } from './sitemap'
import { copyToClipboard } from '@/lib/clipboard'

const sampleSitemap = [
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '<url><loc>https://example.com/</loc><lastmod>2026-07-06</lastmod><priority>0.8</priority></url>',
  '</urlset>',
].join('')

const input = ref('')
const output = ref('')
const summary = ref<SitemapSummary | null>(null)
const warnings = ref<string[]>([])
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => {
  if (!summary.value) return '等待 Sitemap'

  return summary.value.kind === 'urlset'
    ? `${summary.value.urlCount} 个 URL`
    : `${summary.value.sitemapCount} 个 Sitemap`
})

function resetFeedback() {
  errorMessage.value = ''
  warnings.value = []
  copied.value = false
}

function setValidationResult(result: ReturnType<typeof validateSitemap>) {
  if (!result.ok) {
    summary.value = null
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  summary.value = result.summary
  warnings.value = result.warnings
}

function runValidate() {
  resetFeedback()
  const result = validateSitemap(input.value)

  setValidationResult(result)

  if (result.ok) {
    output.value = input.value
    liveMessage.value = 'Sitemap 校验通过'
  }
}

function runFormat() {
  resetFeedback()
  const result = formatSitemap(input.value)

  if (!result.ok) {
    summary.value = null
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  const validation = validateSitemap(input.value)
  setValidationResult(validation)
  output.value = result.value
  liveMessage.value = result.meta
}

function useSample() {
  input.value = sampleSitemap
  output.value = ''
  summary.value = null
  resetFeedback()
  liveMessage.value = 'XML Sitemap 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  summary.value = null
  resetFeedback()
  liveMessage.value = 'XML Sitemap 工作区已清空'
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
  liveMessage.value = 'XML Sitemap 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="XML Sitemap 格式化"
      description="格式化并校验 urlset 或 sitemapindex，检查 loc、lastmod 和 priority 等常见字段。"
      :meta="metaLabel"
    >
      <template #icon>
        <CodeXml class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="runFormat">
            <Sparkles class="h-4 w-4" />
            格式化 Sitemap
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!input" @click="runValidate">
            校验 Sitemap
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

      <dl v-if="summary" class="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">类型</dt>
          <dd class="mt-1 font-mono text-foreground">{{ summary.kind }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">URL</dt>
          <dd class="mt-1 font-mono text-foreground">{{ summary.urlCount }}</dd>
        </div>
        <div class="rounded-md border border-border bg-background/45 px-3 py-2">
          <dt class="text-xs">Sitemap</dt>
          <dd class="mt-1 font-mono text-foreground">{{ summary.sitemapCount }}</dd>
        </div>
      </dl>

      <ul
        v-if="warnings.length"
        class="mt-3 grid gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-sm text-primary"
      >
        <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
      </ul>

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
        label="Sitemap 输入"
        ariaLabel="XML Sitemap 输入"
        :placeholder="sampleSitemap"
        min-height-class="min-h-[30rem]"
        empty-message="粘贴 XML Sitemap、urlset 或 sitemapindex。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="Sitemap 输出"
        ariaLabel="XML Sitemap 输出"
        readonly
        placeholder="执行操作后查看输出"
        min-height-class="min-h-[30rem]"
        empty-message="格式化后的 Sitemap 或校验通过的原文会显示在这里。"
      />
    </div>
  </section>
</template>
