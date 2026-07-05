<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div
    data-testid="tool-announcer"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    {{ message }}
  </div>
</template>
