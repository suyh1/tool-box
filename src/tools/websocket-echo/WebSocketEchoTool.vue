<script setup lang="ts">
import { Check, Clipboard, Plug, RotateCcw, Send, Trash2 } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { createWebSocketConfig, formatTranscript, type WebSocketTranscriptEntry } from './websocket-echo'

const url = ref('wss://echo.websocket.events')
const protocols = ref('')
const message = ref('ping')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const connected = ref(false)
const liveMessage = ref('')
const meta = ref('optional network')
const transcript = ref<WebSocketTranscriptEntry[]>([])

let socket: WebSocket | null = null

const canCopy = computed(() => output.value.length > 0)

function syncOutput() {
  output.value = formatTranscript(transcript.value)
}

function addEntry(entry: WebSocketTranscriptEntry) {
  transcript.value = [...transcript.value, entry]
  syncOutput()
}

function disconnect() {
  socket?.close()
  socket = null
  connected.value = false
}

function connect() {
  errorMessage.value = ''
  copied.value = false
  const config = createWebSocketConfig(url.value, protocols.value)

  if (!config.ok) {
    errorMessage.value = config.message
    liveMessage.value = config.message
    return
  }

  disconnect()
  socket = new WebSocket(config.url, config.protocols)
  addEntry({ direction: 'status', message: `connecting ${config.url}` })
  socket.addEventListener('open', () => {
    connected.value = true
    meta.value = 'connected'
    addEntry({ direction: 'status', message: 'connected' })
  })
  socket.addEventListener('message', (event) => addEntry({ direction: 'received', message: String(event.data) }))
  socket.addEventListener('error', () => addEntry({ direction: 'error', message: 'websocket error' }))
  socket.addEventListener('close', () => {
    connected.value = false
    meta.value = 'closed'
    addEntry({ direction: 'status', message: 'closed' })
  })
}

function sendMessage() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    errorMessage.value = 'WebSocket 尚未连接。'
    liveMessage.value = errorMessage.value
    return
  }

  socket.send(message.value)
  addEntry({ direction: 'sent', message: message.value })
}

function useSample() {
  disconnect()
  url.value = 'wss://echo.websocket.events'
  protocols.value = ''
  message.value = 'ping'
  transcript.value = []
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'optional network'
  liveMessage.value = 'WebSocket 示例已载入'
}

function clearAll() {
  disconnect()
  transcript.value = []
  output.value = ''
  errorMessage.value = ''
  copied.value = false
  meta.value = 'optional network'
  liveMessage.value = 'WebSocket transcript 已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'WebSocket transcript 已复制'
}

onBeforeUnmount(disconnect)
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel title="WebSocket Echo Client" description="连接 ws:// 或 wss:// 端点，发送消息并记录收发 transcript；网络连接仅在点击连接后发生。" :meta="meta">
      <template #icon>
        <Plug class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <Input v-model="url" aria-label="WebSocket URL" placeholder="wss://echo.websocket.events" />
        <Input v-model="protocols" aria-label="WebSocket protocols" placeholder="json, chat" />
      </div>
      <div class="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_8rem]">
        <Input v-model="message" aria-label="WebSocket message" placeholder="ping" />
        <Button type="button" :disabled="!connected" @click="sendMessage">
          <Send class="h-4 w-4" />
          发送
        </Button>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="connected" @click="connect">
            连接
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="!connected" @click="disconnect">
            断开
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
            复制 transcript
          </Button>
        </template>
      </ToolActionBar>

      <p v-if="errorMessage" role="alert" class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel v-model="output" label="Transcript" ariaLabel="WebSocket transcript" readonly placeholder="连接后 transcript 会显示在这里" min-height-class="min-h-[22rem]" empty-message="连接、发送、接收和关闭事件会记录在这里。" />
  </section>
</template>
