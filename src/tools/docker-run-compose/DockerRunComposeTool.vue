<script setup lang="ts">
import { Check, Clipboard, FileText, RotateCcw, Shuffle, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/clipboard'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { convertComposeToDockerRun, convertDockerRunToCompose } from './docker-run-compose'

type Direction = 'compose-to-run' | 'run-to-compose'

const composeSample = `services:
  web:
    image: nginx:alpine
    container_name: web-prod
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production
    volumes:
      - "./site:/usr/share/nginx/html:ro"
    restart: unless-stopped`

const runSample = 'docker run -d --name web -p 8080:80 -e NODE_ENV=production -v ./site:/usr/share/nginx/html:ro --restart unless-stopped nginx:alpine'

const direction = ref<Direction>('compose-to-run')
const input = ref(composeSample)
const output = ref('')
const warnings = ref<string[]>([])
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => output.value.length > 0)
const inputLabel = computed(() => direction.value === 'compose-to-run' ? 'Docker Compose YAML' : 'docker run 命令')
const outputLabel = computed(() => direction.value === 'compose-to-run' ? 'docker run 输出' : 'Compose YAML 输出')
const inputPlaceholder = computed(() => direction.value === 'compose-to-run' ? 'services:' : 'docker run --name app nginx:alpine')
const meta = computed(() => direction.value === 'compose-to-run' ? 'Compose -> run' : 'run -> Compose')

function setDirection(nextDirection: Direction) {
  direction.value = nextDirection
  input.value = nextDirection === 'compose-to-run' ? composeSample : runSample
  output.value = ''
  warnings.value = []
  errorMessage.value = ''
  copied.value = false
  liveMessage.value = nextDirection === 'compose-to-run'
    ? '已切换到 Compose 转 docker run'
    : '已切换到 docker run 转 Compose'
}

function convert() {
  errorMessage.value = ''
  copied.value = false
  const result = direction.value === 'compose-to-run'
    ? convertComposeToDockerRun(input.value)
    : convertDockerRunToCompose(input.value)

  if (!result.ok) {
    output.value = ''
    warnings.value = []
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.output
  warnings.value = result.warnings
  liveMessage.value = warnings.value.length > 0
    ? `转换完成，${warnings.value.length} 个提示`
    : '转换完成'
}

function useSample() {
  input.value = direction.value === 'compose-to-run' ? composeSample : runSample
  output.value = ''
  warnings.value = []
  errorMessage.value = ''
  copied.value = false
  liveMessage.value = 'Docker 转换示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  warnings.value = []
  errorMessage.value = ''
  copied.value = false
  liveMessage.value = 'Docker 转换工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  const result = await copyToClipboard(output.value)
  if (!result.ok) {
    liveMessage.value = result.message
    return
  }

  copied.value = true
  liveMessage.value = 'Docker 转换结果已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="Docker Run / Compose 互换"
      description="在 Docker Compose YAML 和 docker run 命令之间转换，并标出无法无损表达的字段。"
      :meta="meta"
    >
      <template #icon>
        <Shuffle class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="转换方向">
        <Button
          type="button"
          :variant="direction === 'compose-to-run' ? 'default' : 'outline'"
          :aria-pressed="direction === 'compose-to-run'"
          @click="setDirection('compose-to-run')"
        >
          Compose -> docker run
        </Button>
        <Button
          type="button"
          :variant="direction === 'run-to-compose' ? 'default' : 'outline'"
          :aria-pressed="direction === 'run-to-compose'"
          @click="setDirection('run-to-compose')"
        >
          docker run -> Compose
        </Button>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input.trim()" @click="convert">
            <FileText class="h-4 w-4" />
            转换
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

      <p class="mt-3 rounded-md border border-border/65 bg-background/45 px-3 py-2 text-xs leading-5 text-muted-foreground">
        转换完全在本机浏览器中完成；输出是迁移草稿，涉及 build、depends_on、deploy 或运行时资源限制时请结合 Docker 文档复核。
      </p>

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
        :label="inputLabel"
        :ariaLabel="inputLabel"
        :placeholder="inputPlaceholder"
        min-height-class="min-h-[28rem]"
      />
      <ToolTextareaPanel
        v-model="output"
        :label="outputLabel"
        :ariaLabel="outputLabel"
        readonly
        placeholder="点击转换生成输出"
        min-height-class="min-h-[28rem]"
        empty-message="转换后的命令或 Compose YAML 会显示在这里。"
      />
    </div>

    <section
      v-if="warnings.length"
      class="rounded-lg border border-amber-500/35 bg-amber-500/10 p-4"
      aria-label="转换提示"
    >
      <h3 class="text-sm font-semibold text-foreground">转换提示</h3>
      <ul class="mt-2 grid gap-1.5 text-sm leading-6 text-muted-foreground">
        <li v-for="warning in warnings" :key="warning">- {{ warning }}</li>
      </ul>
    </section>
  </section>
</template>
