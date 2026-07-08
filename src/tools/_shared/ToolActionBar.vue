<template>
  <div class="tool-action-bar">
    <div class="tool-action-primary">
      <slot name="primary" />
    </div>
    <div class="grid gap-1.5">
      <div class="tool-action-secondary">
        <slot name="secondary" />
      </div>
      <p class="text-xs leading-5 text-muted-foreground">
        复制会写入系统剪贴板，其他应用可能读取。
      </p>
    </div>
  </div>
</template>
