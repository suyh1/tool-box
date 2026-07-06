<script setup lang="ts">
import { Check, Clipboard, KeyRound, RotateCcw, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { hashBcryptPassword, verifyBcryptPassword } from './bcrypt'

const password = ref('')
const hash = ref('')
const resultOutput = ref('')
const rounds = ref(10)
const errorMessage = ref('')
const copied = ref(false)
const isProcessing = ref(false)
const liveMessage = ref('')

const canCopy = computed(() => hash.value.length > 0 || resultOutput.value.length > 0)
const meta = computed(() => `${rounds.value} rounds`)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

async function hashPassword() {
  resetFeedback()
  isProcessing.value = true
  const result = await hashBcryptPassword(password.value, rounds.value)
  isProcessing.value = false

  if (!result.ok) {
    hash.value = ''
    resultOutput.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  hash.value = result.hash
  resultOutput.value = JSON.stringify({
    rounds: result.rounds,
    truncates: result.truncates,
  }, null, 2)
  liveMessage.value = 'bcrypt hash 已生成'
}

async function verifyPassword() {
  resetFeedback()
  isProcessing.value = true
  const result = await verifyBcryptPassword(password.value, hash.value)
  isProcessing.value = false

  if (!result.ok) {
    resultOutput.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  resultOutput.value = JSON.stringify(result, null, 2)
  liveMessage.value = result.verified ? 'bcrypt 校验通过' : 'bcrypt 校验未通过'
}

function useSample() {
  password.value = 'correct horse battery staple'
  hash.value = ''
  resultOutput.value = ''
  rounds.value = 10
  resetFeedback()
  liveMessage.value = 'bcrypt 示例已载入'
}

function clearAll() {
  password.value = ''
  hash.value = ''
  resultOutput.value = ''
  resetFeedback()
  liveMessage.value = 'bcrypt 工作区已清空'
}

async function copyOutput() {
  const value = hash.value || resultOutput.value

  if (!value) {
    return
  }

  await navigator.clipboard.writeText(value)
  copied.value = true
  liveMessage.value = 'bcrypt 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="bcrypt 哈希 / 校验"
      description="在本地生成 bcrypt password hash，并校验密码与 hash 是否匹配。"
      :meta="meta"
    >
      <template #icon>
        <KeyRound class="h-4 w-4 text-primary" />
      </template>

      <div class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem]">
        <Input
          v-model="password"
          type="password"
          autocomplete="off"
          aria-label="bcrypt password"
          placeholder="password"
        />
        <Input
          v-model.number="rounds"
          type="number"
          min="4"
          max="14"
          step="1"
          aria-label="bcrypt rounds"
        />
      </div>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="isProcessing" @click="hashPassword">
            生成 Hash
          </Button>
        </template>

        <template #secondary>
          <Button type="button" variant="secondary" :disabled="isProcessing || !hash" @click="verifyPassword">
            校验密码
          </Button>
          <Button type="button" variant="ghost" :disabled="isProcessing" @click="useSample">
            <RotateCcw class="h-4 w-4" />
            示例
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
        v-model="hash"
        label="bcrypt Hash"
        ariaLabel="bcrypt hash"
        placeholder="$2b$10$..."
        min-height-class="min-h-[18rem]"
        empty-message="生成后的 hash 会显示在这里，也可以粘贴已有 hash 进行校验。"
      />

      <ToolTextareaPanel
        v-model="resultOutput"
        label="结果"
        ariaLabel="bcrypt 结果"
        readonly
        placeholder="执行后查看结果"
        min-height-class="min-h-[18rem]"
        empty-message="hash 元数据或校验结果会显示在这里。"
      />
    </div>
  </section>
</template>
