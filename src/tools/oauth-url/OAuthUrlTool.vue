<script setup lang="ts">
import { Check, Clipboard, Link, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { buildOAuthAuthorizationUrl } from './oauth-url'

const endpoint = ref('https://auth.example.com/oauth2/authorize')
const clientId = ref('client-123')
const redirectUri = ref('https://app.example.com/callback')
const scope = ref('openid profile')
const state = ref('state-1')
const codeChallenge = ref('challenge')
const extraParams = ref('{"prompt":"consent"}')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('authorization code')

const canCopy = computed(() => output.value.length > 0)

function buildUrl() {
  errorMessage.value = ''
  copied.value = false
  let extra: Record<string, string> = {}

  try {
    extra = extraParams.value.trim() ? JSON.parse(extraParams.value) as Record<string, string> : {}
  } catch {
    errorMessage.value = '额外参数必须是 JSON 对象。'
    liveMessage.value = errorMessage.value
    return
  }

  const result = buildOAuthAuthorizationUrl({
    authorizationEndpoint: endpoint.value,
    clientId: clientId.value,
    redirectUri: redirectUri.value,
    responseType: 'code',
    scope: scope.value,
    state: state.value,
    codeChallenge: codeChallenge.value,
    codeChallengeMethod: 'S256',
    extraParams: extra,
  })

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.url
  meta.value = 'URL ready'
  liveMessage.value = 'OAuth URL 已生成'
}

function useSample() {
  endpoint.value = 'https://auth.example.com/oauth2/authorize'
  clientId.value = 'client-123'
  redirectUri.value = 'https://app.example.com/callback'
  scope.value = 'openid profile'
  state.value = 'state-1'
  codeChallenge.value = 'challenge'
  extraParams.value = '{"prompt":"consent"}'
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'authorization code'
  liveMessage.value = 'OAuth URL 示例已载入'
}

function clearAll() {
  endpoint.value = ''
  clientId.value = ''
  redirectUri.value = ''
  scope.value = ''
  state.value = ''
  codeChallenge.value = ''
  extraParams.value = ''
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'authorization code'
  liveMessage.value = 'OAuth URL 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'OAuth URL 已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="OAuth URL 生成器" description="生成 OAuth/OIDC 授权端点 URL，支持 scope、state、PKCE 和额外参数。" :meta="meta">
      <template #icon>
        <Link class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 lg:grid-cols-2">
        <Input v-model="endpoint" aria-label="授权端点" placeholder="https://auth.example.com/oauth2/authorize" />
        <Input v-model="clientId" aria-label="Client ID" placeholder="client-123" />
        <Input v-model="redirectUri" aria-label="Redirect URI" placeholder="https://app.example.com/callback" />
        <Input v-model="scope" aria-label="Scope" placeholder="openid profile" />
        <Input v-model="state" aria-label="State" placeholder="state" />
        <Input v-model="codeChallenge" aria-label="PKCE code challenge" placeholder="S256 challenge" />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="buildUrl">
            生成 URL
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
            复制 URL
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel v-model="extraParams" label="额外参数 JSON" ariaLabel="OAuth 额外参数 JSON" placeholder='{"prompt":"consent"}' min-height-class="min-h-[12rem]" />
      <ToolTextareaPanel v-model="output" label="授权 URL" ariaLabel="OAuth 授权 URL 输出" readonly placeholder="点击生成 URL" min-height-class="min-h-[12rem]" empty-message="生成的 OAuth 授权 URL 会显示在这里。" />
    </div>
  </section>
</template>
