<script setup lang="ts">
import { Binary, Check, Clipboard, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { analyzeCharacters, getAsciiTable } from './ascii'

const input = ref('')
const output = ref('')
const copied = ref(false)
const liveMessage = ref('')
const asciiTable = getAsciiTable()

const characterRows = computed(() => analyzeCharacters(input.value))
const canCopy = computed(() => output.value.length > 0)
const metaLabel = computed(() => input.value ? `${characterRows.value.length} 个字符` : '128 ASCII')

function refreshOutput() {
  output.value = characterRows.value
    .map((row) => `${row.character}\tDEC ${row.codePoint}\tHEX ${row.hex}\tBIN ${row.binary}\t${row.htmlEntity}`)
    .join('\n')
  copied.value = false
  liveMessage.value = output.value ? '字符码已生成' : '请输入字符'
}

function useSample() {
  input.value = 'A中'
  output.value = ''
  copied.value = false
  liveMessage.value = 'ASCII 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  copied.value = false
  liveMessage.value = 'ASCII 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = '字符码输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="ASCII / 字符码表"
      description="查看 0-127 ASCII 参考表，并把输入字符转换为十进制、十六进制、二进制和 HTML 实体。"
      :meta="metaLabel"
    >
      <template #icon>
        <Binary class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="refreshOutput">
            生成字符码
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
    </ToolPanel>

    <div class="grid gap-4 lg:grid-cols-2">
      <ToolTextareaPanel
        v-model="input"
        label="字符输入"
        ariaLabel="ASCII 字符输入"
        placeholder="A中"
        min-height-class="min-h-[20rem]"
        empty-message="输入任意字符，生成 Unicode 码点和常用表示。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="字符码输出"
        ariaLabel="ASCII 字符码输出"
        readonly
        placeholder="执行生成后查看输出"
        min-height-class="min-h-[20rem]"
        empty-message="字符码清单会显示在这里。"
      />
    </div>

    <section class="tool-field grid gap-3 rounded-lg border border-border bg-card p-4">
      <div>
        <h3 class="text-sm font-medium text-foreground">ASCII 参考表</h3>
        <p class="mt-1 text-xs leading-5 text-muted-foreground">0-127 十进制、十六进制、二进制和显示名。</p>
      </div>
      <div class="max-h-[32rem] overflow-auto rounded-md border border-border bg-background/55">
        <table class="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead class="sticky top-0 z-10 bg-muted text-muted-foreground">
            <tr>
              <th class="border-b border-border px-3 py-2">DEC</th>
              <th class="border-b border-l border-border px-3 py-2">HEX</th>
              <th class="border-b border-l border-border px-3 py-2">BIN</th>
              <th class="border-b border-l border-border px-3 py-2">CHAR</th>
              <th class="border-b border-l border-border px-3 py-2">TYPE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in asciiTable" :key="row.decimal" class="odd:bg-background/40">
              <td class="border-b border-border px-3 py-2 font-mono">{{ row.decimal }}</td>
              <td class="border-b border-l border-border px-3 py-2 font-mono">{{ row.hex }}</td>
              <td class="border-b border-l border-border px-3 py-2 font-mono">{{ row.binary }}</td>
              <td class="border-b border-l border-border px-3 py-2 font-mono">{{ row.display }}</td>
              <td class="border-b border-l border-border px-3 py-2 text-muted-foreground">{{ row.kind }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
