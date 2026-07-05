<script setup lang="ts">
import { Search, Star } from '@lucide/vue'
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToolsStore } from '@/stores/tools'
import {
  categoryCodes,
  categoryLabels,
  getGroupedToolsByCategory,
  isToolCategory,
  searchTools,
} from '@/tools/catalog'
import { tools } from '@/tools/registry'

const route = useRoute()
const toolsStore = useToolsStore()
const query = ref('')

const category = computed(() => {
  const value = String(route.params.category ?? '')
  return isToolCategory(value) ? value : null
})
const categoryTools = computed(() => category.value
  ? tools.filter((tool) => tool.category === category.value)
  : [])
const matchingTools = computed(() => searchTools(categoryTools.value, query.value))
const groups = computed(() => category.value
  ? getGroupedToolsByCategory(matchingTools.value, category.value)
  : [])

function toggleFavorite(toolId: string) {
  toolsStore.toggleFavorite(toolId)
}
</script>

<template>
  <section class="grid gap-4">
    <div class="rounded-lg border border-border bg-card p-4 md:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <Badge v-if="category" variant="secondary">{{ categoryCodes[category] }}</Badge>
            <h2 class="text-base font-semibold text-foreground">
              {{ category ? `${categoryLabels[category]}工具` : '未知分类' }}
            </h2>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ category ? `按功能组浏览 ${categoryLabels[category]} 分类下的工具。` : '这个分类不存在。' }}
          </p>
        </div>
        <RouterLink
          to="/tools"
          class="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          返回目录
        </RouterLink>
      </div>

      <label v-if="category" class="mt-4 grid gap-2">
        <span class="text-sm font-medium text-foreground">筛选当前分类</span>
        <span class="relative block">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="query"
            type="search"
            class="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="输入工具名称、关键词或别名"
          >
        </span>
      </label>
    </div>

    <div v-if="groups.length" class="grid gap-4">
      <section
        v-for="group in groups"
        :key="group.group"
        class="rounded-lg border border-border bg-card p-4 md:p-5"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-foreground">{{ group.group }}</h3>
          <Badge variant="outline">{{ group.tools.length }}</Badge>
        </div>

        <div class="grid gap-2">
          <article
            v-for="tool in group.tools"
            :key="tool.id"
            class="grid gap-3 rounded-md border border-border bg-background/55 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <RouterLink :to="tool.path" class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="text-sm font-medium text-foreground">{{ tool.title }}</h4>
                <Badge variant="secondary">{{ categoryCodes[tool.category] }}</Badge>
              </div>
              <p class="mt-1 text-xs leading-5 text-muted-foreground">{{ tool.description }}</p>
              <p v-if="tool.keywords.length" class="mt-2 truncate font-mono text-[10px] text-muted-foreground">
                {{ tool.keywords.join(' / ') }}
              </p>
            </RouterLink>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-muted-foreground"
              :aria-label="`${toolsStore.favoriteIds.includes(tool.id) ? '移除' : '添加'} ${tool.title} 收藏`"
              @click="toggleFavorite(tool.id)"
            >
              <Star class="h-4 w-4" :class="toolsStore.favoriteIds.includes(tool.id) ? 'fill-primary text-primary' : ''" />
            </Button>
          </article>
        </div>
      </section>
    </div>

    <p v-else class="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
      {{ category ? '当前筛选条件下没有工具。' : '请返回工具目录选择一个分类。' }}
    </p>
  </section>
</template>
