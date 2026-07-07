<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { inspectSshKey } from './ssh-key'
import { copyToClipboard } from '@/lib/clipboard'

const samplePublicKey =
  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHRXoxcoDbj82TZ5Tfa61ZmGACsrsYY9v/XJVjMBq8NT dev@toolbox'

const samplePrivateKey = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACB0V6MXKA24/Nk2eU32utWZhgArK7GGPb/1yVYzAavDUwAAAJAzfjsCM347
AgAAAAtzc2gtZWQyNTUxOQAAACB0V6MXKA24/Nk2eU32utWZhgArK7GGPb/1yVYzAavDUw
AAAEAZ7CYpvbOZ2pINQfruu9GWcHbBWv4iIWyqJgsZTZIOyHRXoxcoDbj82TZ5Tfa61ZmG
ACsrsYY9v/XJVjMBq8NTAAAAC2RldkB0b29sYm94AQI=
-----END OPENSSH PRIVATE KEY-----`

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')
const meta = ref('OpenSSH')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function inspectKey() {
  resetFeedback()
  isProcessing.value = true
  const result = await inspectSshKey(input.value)
  isProcessing.value = false

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.keyType} / ${result.bitLength || '?'} bit`
  liveMessage.value = 'SSH key 已解析'
}

function usePublicSample() {
  input.value = samplePublicKey
  output.value = ''
  resetFeedback()
  meta.value = '公钥示例'
  liveMessage.value = 'SSH 公钥示例已载入'
}

function usePrivateSample() {
  input.value = samplePrivateKey
  output.value = ''
  resetFeedback()
  meta.value = '私钥示例'
  liveMessage.value = 'SSH 私钥示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'OpenSSH'
  liveMessage.value = 'SSH key 工作区已清空'
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
  liveMessage.value = 'SSH key 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="SSH Key Inspector"
      description="本地检查 OpenSSH 公钥和私钥 armor 的类型、位数、指纹和注释。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input || isProcessing" @click="inspectKey">
            检查 SSH Key
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="usePublicSample">
            <RotateCcw class="h-4 w-4" />
            公钥示例
          </Button>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="usePrivateSample">
            <RotateCcw class="h-4 w-4" />
            私钥示例
          </Button>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="clearAll">
            <Trash2 class="h-4 w-4" />
            清空
          </Button>
          <Button type="button" variant="outline" :disabled="!canCopy || isProcessing" @click="copyOutput">
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
        label="SSH Key"
        ariaLabel="SSH key 输入"
        placeholder="ssh-ed25519 AAAA..."
        min-height-class="min-h-[30rem]"
        empty-message="粘贴 OpenSSH 公钥行或 OPENSSH PRIVATE KEY。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="检查结果"
        ariaLabel="SSH key 检查结果"
        readonly
        placeholder="检查后查看 JSON 元数据"
        min-height-class="min-h-[30rem]"
        empty-message="key 类型、位数、SHA256 指纹和注释会显示在这里。"
      />
    </div>
  </section>
</template>
