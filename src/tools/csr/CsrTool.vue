<script setup lang="ts">
import { Check, Clipboard, RotateCcw, ShieldCheck, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ToolActionBar from '@/tools/_shared/ToolActionBar.vue'
import ToolAnnouncer from '@/tools/_shared/ToolAnnouncer.vue'
import ToolPanel from '@/tools/_shared/ToolPanel.vue'
import ToolTextareaPanel from '@/tools/_shared/ToolTextareaPanel.vue'
import { parseCertificateSigningRequest } from './csr'

const sampleCsr = `-----BEGIN CERTIFICATE REQUEST-----
MIIC0DCCAbgCAQAwRTEaMBgGA1UEAwwRYXBpLnRvb2xib3gubG9jYWwxGjAYBgNV
BAoMEURldmVsb3BlciBUb29sYm94MQswCQYDVQQGEwJVUzCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAN0t4+/nYG6jXkxWX081K9JcUFmHfLn9RM42oWcA
sMwvrdiY22h0QkmBWOXihS3DZAB5YoHM6yxUNlboBDm3j8ik+6wHptn8w9wsprmH
RJR2JdXipB4TrF2dloa5Caq/zpgqoOe9XR0JdpUMqfBYTjtW05iHlY2vcg04g6lv
Fi2ozvzVOAEwtefyIp0Vn1y5rmBYfUDJBn7xtLUYTHasIhmt6ecE25jRl4tKrpJz
7XwJSwhawiAY9ps/I4vVUkHsWQp/Gi+wO67BEWzPn8EwPVR6MWpTV9stRwJ6meaR
OaDjVbse0DB+904KMJzJRLRvaeL5z9lbiyESdjtUKSDfidsCAwEAAaBGMEQGCSqG
SIb3DQEJDjE3MDUwMwYDVR0RBCwwKoIRYXBpLnRvb2xib3gubG9jYWyCFXd3dy5h
cGkudG9vbGJveC5sb2NhbDANBgkqhkiG9w0BAQsFAAOCAQEANIH1nQoppG9NXmM7
vjph9ABlqLsmBncSWD4Y6vVyUZoWqxURNO78THzhSvzma7ZgDqPOauV1Pe8CEMfw
rRyvQo+uOkS6/Mjc+E+OKlXcrh/1M2qW10QxYRKvHqRcbZ0W4T6kEWt4wconZ0S5
X6cyer21jMhNS7WDeFrKmuHrwDqkwnXSrB+8LQGLRmSigfKCIcEt8LMWP8396iMf
+X/6DA05adCsVJqA5OCa06YNyo6cJSYDK681leaU67JLe9glhAlQ3FGTMssZHbf1
zrRDuTiipHg/nFfQXMhEY3067MkKFJrqKuvNVvu4k2/AlcJKV+lFgI908qrpkn4W
vtHpaA==
-----END CERTIFICATE REQUEST-----`

const input = ref('')
const output = ref('')
const errorMessage = ref('')
const copied = ref(false)
const liveMessage = ref('')
const meta = ref('PEM')

const canCopy = computed(() => output.value.length > 0)

function resetFeedback() {
  errorMessage.value = ''
  copied.value = false
}

function parseCsr() {
  resetFeedback()
  const result = parseCertificateSigningRequest(input.value)

  if (!result.ok) {
    output.value = ''
    errorMessage.value = result.message
    liveMessage.value = result.message
    return
  }

  output.value = JSON.stringify(result, null, 2)
  meta.value = `${result.publicKeyAlgorithm} / ${result.dnsNames.length} SAN`
  liveMessage.value = 'CSR 已解析'
}

function useSample() {
  input.value = sampleCsr
  output.value = ''
  resetFeedback()
  meta.value = '示例已载入'
  liveMessage.value = 'CSR 示例已载入'
}

function clearAll() {
  input.value = ''
  output.value = ''
  resetFeedback()
  meta.value = 'PEM'
  liveMessage.value = 'CSR 工作区已清空'
}

async function copyOutput() {
  if (!canCopy.value) {
    return
  }

  await navigator.clipboard.writeText(output.value)
  copied.value = true
  liveMessage.value = 'CSR 输出已复制'
}
</script>

<template>
  <section class="grid gap-4">
    <ToolAnnouncer :message="liveMessage" />
    <ToolPanel
      title="CSR 解析"
      description="本地解析 PEM CSR 的主体、公钥算法、签名算法和请求的 SAN 域名。"
      :meta="meta"
    >
      <template #icon>
        <ShieldCheck class="h-4 w-4 text-primary" />
      </template>

      <ToolActionBar>
        <template #primary>
          <Button type="button" :disabled="!input" @click="parseCsr">
            解析 CSR
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
        label="CSR PEM"
        ariaLabel="CSR 输入"
        placeholder="-----BEGIN CERTIFICATE REQUEST-----"
        min-height-class="min-h-[32rem]"
        empty-message="粘贴 PEM 格式 CSR 以解析证书请求元数据。"
      />

      <ToolTextareaPanel
        v-model="output"
        label="解析结果"
        ariaLabel="CSR 解析结果"
        readonly
        placeholder="解析后查看 JSON 元数据"
        min-height-class="min-h-[32rem]"
        empty-message="CSR 主体、公钥算法、签名算法和 SAN 域名会显示在这里。"
      />
    </div>
  </section>
</template>
