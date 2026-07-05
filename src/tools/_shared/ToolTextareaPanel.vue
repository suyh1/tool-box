<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@/components/ui/textarea'

const props = withDefaults(defineProps<{
  modelValue: string
  label: string
  ariaLabel: string
  placeholder?: string
  emptyMessage?: string
  readonly?: boolean
  minHeightClass?: string
}>(), {
  placeholder: '',
  emptyMessage: '',
  readonly: false,
  minHeightClass: 'min-h-[20rem]',
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (nextValue) => emit('update:modelValue', nextValue),
})
</script>

<template>
  <label class="tool-field grid gap-2 rounded-lg border border-border bg-card p-4">
    <span class="text-sm font-medium text-foreground">{{ label }}</span>
    <p
      v-if="emptyMessage && !modelValue"
      class="rounded-md border border-border/65 bg-background/45 px-3 py-2 text-xs leading-5 text-muted-foreground"
    >
      {{ emptyMessage }}
    </p>
    <Textarea
      v-model="value"
      :aria-label="ariaLabel"
      :readonly="readonly"
      spellcheck="false"
      :placeholder="placeholder"
      class="resize-y border-border bg-background/70 font-mono text-sm leading-6"
      :class="minHeightClass"
    />
  </label>
</template>
