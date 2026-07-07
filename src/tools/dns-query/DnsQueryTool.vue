<script setup lang="ts">
import { Check, Clipboard, Network, RotateCcw, Search, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { buildDohUrl, normalizeDohResponse, type DnsProvider, type DnsRecordType } from './dns-query'
import { copyToClipboard } from '@/lib/clipboard'

const name = ref('example.com')
const type = ref<DnsRecordType>('A')
const provider = ref<DnsProvider>('cloudflare')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('DNS-over-HTTPS')

const canCopy = computed(() => output.value.length > 0)

async function queryDns() {
  errorMessage.value = ''
  copied.value = false
  const request = buildDohUrl({ provider: provider.value, name: name.value, type: type.value })

  if (!request.ok) {
    output.value = ''
    errorMessage.value = request.message
    liveMessage.value = request.message
    return
  }

  try {
    const response = await fetch(request.url, {
      headers: { accept: 'application/dns-json' },
    })
    const json = await response.json() as unknown
    const result = normalizeDohResponse(json)
    output.value = JSON.stringify({ requestUrl: request.url, ...result }, null, 2)
    meta.value = `${result.answers.length} answers`
    liveMessage.value = 'DNS 查询完成'
  } catch (error) {
    output.value = JSON.stringify({ requestUrl: request.url }, null, 2)
    errorMessage.value = error instanceof Error ? `DNS 查询失败：${error.message}` : 'DNS 查询失败'
    liveMessage.value = errorMessage.value
  }
}

function buildUrlOnly() {
  errorMessage.value = ''
  copied.value = false
  const request = buildDohUrl({ provider: provider.value, name: name.value, type: type.value })

  if (!request.ok) {
    output.value = ''
    errorMessage.value = request.message
    liveMessage.value = request.message
    return
  }

  output.value = request.url
  meta.value = 'request URL'
  liveMessage.value = 'DoH URL 已生成'
}

function useSample() {
  name.value = 'example.com'
  type.value = 'A'
  provider.value = 'cloudflare'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'DNS-over-HTTPS'
  liveMessage.value = 'DNS 示例已载入'
}

function clearAll() {
  name.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'DNS-over-HTTPS'
  liveMessage.value = 'DNS 工作区已清空'
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
  liveMessage.value = 'DNS 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="DNS 查询" description="构造 DNS-over-HTTPS 查询 URL，并可在浏览器中发起 A/AAAA/CNAME/MX/NS/TXT 查询。" :meta="meta">
      <template #icon>
        <Network class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_12rem]">
        <Input v-model="name" aria-label="DNS 查询域名" placeholder="example.com" />
        <label class="grid gap-1 text-sm font-medium text-foreground">
          类型
          <select v-model="type" aria-label="DNS 记录类型" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="A">A</option>
            <option value="AAAA">AAAA</option>
            <option value="CNAME">CNAME</option>
            <option value="MX">MX</option>
            <option value="NS">NS</option>
            <option value="TXT">TXT</option>
          </select>
        </label>
        <label class="grid gap-1 text-sm font-medium text-foreground">
          Provider
          <select v-model="provider" aria-label="DNS over HTTPS Provider" class="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="cloudflare">Cloudflare</option>
            <option value="google">Google</option>
          </select>
        </label>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="queryDns">
            <Search class="h-4 w-4" />
            查询 DNS
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" @click="buildUrlOnly">
            生成 DoH URL
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

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel v-model="output" label="DNS 输出" ariaLabel="DNS 查询输出" readonly placeholder="点击查询 DNS 或生成 DoH URL" min-height-class="min-h-[22rem]" empty-message="DoH URL 或 DNS 响应摘要会显示在这里。" />
  </section>
</template>
