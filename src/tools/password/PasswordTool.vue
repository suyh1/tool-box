<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { generatePassword } from './password'
import { copyToClipboard } from '@/lib/clipboard'

const length = ref(20)
const includeLowercase = ref(true)
const includeUppercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(true)
const avoidAmbiguous = ref(false)
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('20 位')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function currentOptions() {
  return {
    length: length.value,
    includeLowercase: includeLowercase.value,
    includeUppercase: includeUppercase.value,
    includeNumbers: includeNumbers.value,
    includeSymbols: includeSymbols.value,
    avoidAmbiguous: avoidAmbiguous.value,
  }
}

function generateOne() {
  resetFeedback()
  const result = generatePassword(currentOptions())

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = result.password
  meta.value = `${result.length} 位 / ${result.characterSetSize} 字符`
  liveMessage.value = '密码已生成'
}

function generateBatch() {
  resetFeedback()
  const passwords: string[] = []

  for (let index = 0; index < 5; index += 1) {
    const result = generatePassword(currentOptions())

    if (!result.ok) {
      output.value = ''
      errorMessage.value = result.message
      liveMessage.value = result.message
      return
    }

    passwords.push(result.password)
    meta.value = `${result.length} 位 / ${result.characterSetSize} 字符`
  }

  output.value = passwords.join('\n')
  liveMessage.value = '已生成 5 个密码'
}

function useSample() {
  length.value = 20
  includeLowercase.value = true
  includeUppercase.value = true
  includeNumbers.value = true
  includeSymbols.value = true
  avoidAmbiguous.value = true
  output.value = ''
  resetFeedback()
  meta.value = '20 位'
  liveMessage.value = '密码生成器示例选项已载入'
}

function clearAll() {
  output.value = ''
  resetFeedback()
  meta.value = `${length.value} 位`
  liveMessage.value = '密码生成器输出已清空'
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
  liveMessage.value = '密码输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="密码生成器"
      description="使用浏览器安全随机数生成可配置长度和字符集的随机密码。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-4 lg:grid-cols-[10rem_minmax(0,1fr)]">
        <label class="grid gap-1 text-sm font-medium text-foreground">
          长度
          <Input v-model.number="length" type="number" min="4" max="256" step="1" aria-label="密码长度" />
        </label>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="includeLowercase" type="checkbox" class="h-4 w-4 accent-primary">
            小写
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="includeUppercase" type="checkbox" class="h-4 w-4 accent-primary">
            大写
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="includeNumbers" type="checkbox" class="h-4 w-4 accent-primary">
            数字
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="includeSymbols" type="checkbox" class="h-4 w-4 accent-primary">
            符号
          </label>
          <label class="flex items-center gap-2 text-sm text-muted-foreground">
            <input v-model="avoidAmbiguous" type="checkbox" class="h-4 w-4 accent-primary">
            排除易混淆
          </label>
        </div>
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" @click="generateOne">
            生成密码
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" @click="generateBatch">
            生成 5 个
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

      <p
        v-if="errorMessage"
        role="alert"
        class="mt-3 rounded-md border border-destructive/45 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {{ errorMessage }}
      </p>
    </ToolPanel>

    <ToolTextareaPanel
      v-model="output"
      label="生成结果"
      ariaLabel="密码生成结果"
      readonly
      placeholder="点击生成密码"
      min-height-class="min-h-[18rem]"
      empty-message="生成的密码会显示在这里，每个密码占一行。"
    />
  </section>
</template>
