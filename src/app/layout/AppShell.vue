<script setup lang="ts">
import {
  Binary,
  CaseSensitive,
  CheckCircle2,
  Clock3,
  Code2,
  Command as CommandIcon,
  CopyCheck,
  FileJson2,
  Fingerprint,
  GitCompare,
  Hash,
  KeyRound,
  Link2,
  Moon,
  Regex,
  Search,
  ShieldCheck,
  Star,
  SunMedium,
  TerminalSquare,
  WandSparkles,
} from '@lucide/vue'
import { gsap } from 'gsap'
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getToolById, getToolByPath, tools } from '@/tools/registry'
import { usePreferencesStore } from '@/stores/preferences'
import { useToolsStore } from '@/stores/tools'
import type { ToolCategory } from '@/tools/types'

const route = useRoute()
const router = useRouter()
const preferences = usePreferencesStore()
const toolsStore = useToolsStore()

const shellRoot = ref<HTMLElement | null>(null)
const contentPanel = ref<HTMLElement | null>(null)
const searchOpen = ref(false)
const commandFilter = ref<'all' | 'recent' | 'favorites' | ToolCategory>('all')
let motionMedia: gsap.MatchMedia | null = null
let routeTween: ReturnType<typeof gsap.fromTo> | null = null

const currentTool = computed(() => getToolByPath(route.path) ?? tools[0])
const themeIcon = computed(() => preferences.effectiveTheme === 'dark' ? SunMedium : Moon)
const themeLabel = computed(() => preferences.effectiveTheme === 'dark' ? '切换到亮色' : '切换到深色')
const favoriteCount = computed(() => toolsStore.favoriteIds.length)
const activeToolCount = computed(() => tools.filter((tool) => tool.status === 'active').length)
const recentTools = computed(() => toolsStore.recentIds
  .map((toolId) => getToolById(toolId))
  .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool))
  .slice(0, 3))

const categoryLabels: Record<ToolCategory, string> = {
  format: '格式化',
  encode: '编码',
  time: '时间',
  security: '安全',
  generate: '生成',
  code: '代码',
  text: '文本',
}

const categoryOrder: ToolCategory[] = ['format', 'encode', 'time', 'security', 'generate', 'code', 'text']

const categoryCodes: Record<ToolCategory, string> = {
  format: 'FMT',
  encode: 'ENC',
  time: 'CLK',
  security: 'SEC',
  generate: 'GEN',
  code: 'COD',
  text: 'TXT',
}

const toolIconMap: Record<string, Component> = {
  json: FileJson2,
  base64: Binary,
  url: Link2,
  timestamp: Clock3,
  jwt: KeyRound,
  hash: Hash,
  uuid: Fingerprint,
  'json-type': Code2,
  regex: Regex,
  diff: GitCompare,
  case: CaseSensitive,
}

const categoryCounts = computed(() => tools.reduce((counts, tool) => {
  counts[tool.category] = (counts[tool.category] ?? 0) + 1
  return counts
}, {} as Record<ToolCategory, number>))

const commandFilterLabel = computed(() => {
  if (commandFilter.value === 'all') {
    return '全部工具'
  }

  if (commandFilter.value === 'recent') {
    return '最近使用'
  }

  if (commandFilter.value === 'favorites') {
    return '收藏工具'
  }

  return categoryLabels[commandFilter.value]
})

const commandEmptyMessage = computed(() => {
  if (commandFilter.value === 'recent') {
    return '还没有最近使用的工具'
  }

  if (commandFilter.value === 'favorites') {
    return '还没有收藏工具'
  }

  if (commandFilter.value === 'all') {
    return '工具列表为空'
  }

  return `${categoryLabels[commandFilter.value]} 分类暂无工具`
})

const commandEmptyHint = computed(() => {
  if (commandFilter.value === 'favorites') {
    return '在左侧工具列表点击星标，即可把常用工具固定到这里。'
  }

  if (commandFilter.value === 'recent') {
    return '打开任意工具后，它会自动出现在最近使用中。'
  }

  return '切换筛选条件或使用搜索框查找其他工具。'
})

const commandTools = computed(() => {
  if (commandFilter.value === 'all') {
    return tools
  }

  if (commandFilter.value === 'recent') {
    return recentTools.value
  }

  if (commandFilter.value === 'favorites') {
    return tools.filter((tool) => toolsStore.favoriteIds.includes(tool.id))
  }

  return tools.filter((tool) => tool.category === commandFilter.value)
})

const statusLabel = computed(() => currentTool.value.status === 'active' ? '本地可用' : '规划中')
const statusIcon = computed(() => currentTool.value.status === 'active' ? CheckCircle2 : WandSparkles)

watch(
  currentTool,
  (tool) => {
    toolsStore.recordRecent(tool.id)
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  async () => {
    await nextTick()

    if (!contentPanel.value || prefersReducedMotion()) {
      return
    }

    routeTween?.kill()
    routeTween = gsap.fromTo(
      contentPanel.value,
      { autoAlpha: 0.45, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.46,
        ease: 'power3.out',
        clearProps: 'opacity,visibility,transform',
      },
    )
  },
)

function getToolIcon(toolId: string) {
  return toolIconMap[toolId] ?? Code2
}

function toggleTheme() {
  preferences.setTheme(preferences.effectiveTheme === 'dark' ? 'light' : 'dark')
}

function isFavorite(toolId: string) {
  return toolsStore.favoriteIds.includes(toolId)
}

function navigateToTool(path: string) {
  searchOpen.value = false

  if (route.path !== path) {
    router.push(path)
  }
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = true
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  if (!shellRoot.value) {
    return
  }

  motionMedia = gsap.matchMedia()
  motionMedia.add('(prefers-reduced-motion: no-preference)', () => {
    const timeline = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    })

    timeline
      .from('.shell-reveal', {
        opacity: 0.84,
        y: 18,
        duration: 0.68,
        stagger: 0.06,
      })
      .from('.tool-row', {
        opacity: 0.82,
        x: -14,
        duration: 0.42,
        stagger: 0.025,
      }, '-=0.42')
      .from('.metric-tile', {
        opacity: 0.86,
        y: 10,
        duration: 0.38,
        stagger: 0.05,
      }, '-=0.28')
  }, shellRoot.value)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  motionMedia?.revert()
  routeTween?.kill()
})
</script>

<template>
  <div ref="shellRoot" class="toolbox-shell min-h-[100dvh] bg-background text-foreground">
    <header class="shell-reveal sticky top-3 z-30 px-3 md:top-4 md:px-5">
      <div class="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/82 px-3 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl md:px-4">
        <RouterLink to="/tools/json" class="group flex min-w-0 items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/35 bg-primary/14 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors group-hover:bg-primary/20">
            <TerminalSquare class="h-5 w-5" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold tracking-tight">开发者工具箱</span>
            <span class="block truncate font-mono text-[11px] text-muted-foreground">local browser utilities</span>
          </span>
        </RouterLink>

        <div class="hidden min-w-0 flex-1 items-center justify-center gap-2 px-4 lg:flex">
          <Badge variant="secondary" class="gap-1.5">
            <ShieldCheck class="h-3 w-3 text-primary" />
            输入留在浏览器
          </Badge>
          <Badge variant="outline" class="gap-1.5">
            <CopyCheck class="h-3 w-3" />
            {{ activeToolCount }} 个可用工具
          </Badge>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            aria-label="搜索工具"
            class="hidden h-9 gap-2 border-border/90 bg-background/45 px-3 text-muted-foreground hover:bg-secondary hover:text-foreground sm:inline-flex"
            @click="searchOpen = true"
          >
            <Search class="h-4 w-4" />
            <span class="text-sm">搜索</span>
            <span class="rounded border border-border/70 bg-secondary/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘K</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label="搜索工具"
            class="h-9 w-9 border-border/90 bg-background/45 text-muted-foreground hover:bg-secondary hover:text-foreground sm:hidden"
            @click="searchOpen = true"
          >
            <Search class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            type="button"
            :aria-label="themeLabel"
            class="h-9 w-9 border-border/90 bg-background/45 text-muted-foreground hover:bg-secondary hover:text-foreground"
            @click="toggleTheme"
          >
            <component :is="themeIcon" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-[1500px] gap-4 px-3 pb-8 pt-6 md:grid-cols-[19rem_minmax(0,1fr)] md:px-5 md:pb-10 lg:gap-6">
      <aside class="shell-reveal self-start overflow-hidden rounded-lg border border-border/70 bg-card/76 p-3 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl md:sticky md:top-24 md:max-h-[calc(100dvh-7rem)] md:overflow-auto">
        <div class="mb-4 grid gap-3 rounded-md border border-border/60 bg-background/38 p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-mono text-[11px] text-muted-foreground">tool dock</p>
              <h2 class="mt-1 text-base font-semibold tracking-tight text-foreground">工作台</h2>
            </div>
            <Badge variant="secondary" class="gap-1">
              <Star class="h-3 w-3 text-primary" />
              {{ favoriteCount }}
            </Badge>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="metric-tile rounded-md border border-border/55 bg-card/70 px-2 py-2">
              <p class="font-mono text-[11px] text-muted-foreground">ACTIVE</p>
              <p class="mt-1 text-lg font-semibold tabular-nums">{{ activeToolCount }}</p>
            </div>
            <div class="metric-tile rounded-md border border-border/55 bg-card/70 px-2 py-2">
              <p class="font-mono text-[11px] text-muted-foreground">FAV</p>
              <p class="mt-1 text-lg font-semibold tabular-nums">{{ favoriteCount }}</p>
            </div>
            <div class="metric-tile rounded-md border border-border/55 bg-card/70 px-2 py-2">
              <p class="font-mono text-[11px] text-muted-foreground">RECENT</p>
              <p class="mt-1 text-lg font-semibold tabular-nums">{{ recentTools.length }}</p>
            </div>
          </div>
        </div>

        <nav aria-label="工具导航" class="flex gap-2 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0">
          <div
            v-for="tool in tools"
            :key="tool.id"
            class="tool-row group grid w-60 shrink-0 grid-cols-[1fr_2rem] items-center gap-1 rounded-md md:w-auto"
          >
            <RouterLink
              :to="tool.path"
              class="min-w-0 rounded-md px-3 py-2.5 transition-all"
              :class="[
                route.path === tool.path
                  ? 'bg-primary/14 text-foreground ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
              ]"
            >
              <span class="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded border border-border/60 bg-background/45"
                  :class="route.path === tool.path ? 'text-primary' : 'text-muted-foreground'"
                >
                  <component :is="getToolIcon(tool.id)" class="h-3.5 w-3.5" />
                </span>
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium">{{ tool.title }}</span>
                  <span class="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                    {{ categoryCodes[tool.category] }} / {{ categoryCounts[tool.category] }}
                  </span>
                </span>
              </span>
            </RouterLink>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              :aria-label="`${isFavorite(tool.id) ? '移除' : '添加'} ${tool.title} 收藏`"
              class="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
              @click="toolsStore.toggleFavorite(tool.id)"
            >
              <Star
                class="h-4 w-4"
                :class="isFavorite(tool.id) ? 'fill-primary text-primary' : ''"
              />
            </Button>
          </div>
        </nav>
      </aside>

      <section class="min-w-0">
        <div class="shell-reveal mb-4 overflow-hidden rounded-lg border border-border/70 bg-card/82 shadow-[0_22px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div class="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_18rem] md:p-5 lg:p-6">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" class="gap-1.5">
                  <component :is="statusIcon" class="h-3 w-3 text-primary" />
                  {{ statusLabel }}
                </Badge>
                <Badge variant="outline">{{ categoryLabels[currentTool.category] }}</Badge>
              </div>
              <div class="mt-4 flex min-w-0 items-center gap-3">
                <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/12 text-primary">
                  <component :is="getToolIcon(currentTool.id)" class="h-6 w-6" />
                </span>
                <div class="min-w-0">
                  <h1 class="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                    {{ currentTool.title }}
                  </h1>
                  <p class="mt-2 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground md:text-base">
                    {{ currentTool.description }}
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-2 rounded-md border border-border/60 bg-background/40 p-3">
              <div class="flex items-center gap-2 text-sm text-foreground">
                <CommandIcon class="h-4 w-4 text-primary" />
                快速入口
              </div>
              <button
                type="button"
                class="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card/68 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                @click="searchOpen = true"
              >
                <span class="truncate">按名称、格式或关键词搜索工具</span>
                <span class="rounded border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">⌘K</span>
              </button>
              <div v-if="recentTools.length > 0" class="flex flex-wrap gap-1.5 pt-1">
                <RouterLink
                  v-for="tool in recentTools"
                  :key="tool.id"
                  :to="tool.path"
                  class="rounded border border-border/60 bg-card/58 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {{ tool.title }}
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <div ref="contentPanel" class="shell-reveal min-w-0">
          <RouterView :key="route.fullPath" />
        </div>
      </section>
    </main>

    <CommandDialog
      v-model:open="searchOpen"
      title="搜索工具"
      description="输入工具名称、分类或关键词。"
      class="border border-border/80 bg-popover/96 p-0 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:max-w-xl"
      show-close-button
    >
      <CommandInput placeholder="搜索 JSON、JWT、哈希、正则..." />
      <div class="grid gap-2 border-b border-border/70 px-2 pb-2 pt-1">
        <div class="flex gap-1 overflow-x-auto">
          <Button
            type="button"
            size="sm"
            :variant="commandFilter === 'all' ? 'default' : 'ghost'"
            @click="commandFilter = 'all'"
          >
            全部
          </Button>
          <Button
            type="button"
            size="sm"
            :variant="commandFilter === 'recent' ? 'default' : 'ghost'"
            @click="commandFilter = 'recent'"
          >
            最近
          </Button>
          <Button
            type="button"
            size="sm"
            :variant="commandFilter === 'favorites' ? 'default' : 'ghost'"
            @click="commandFilter = 'favorites'"
          >
            收藏
          </Button>
        </div>
        <div class="flex gap-1 overflow-x-auto">
          <Button
            v-for="category in categoryOrder"
            :key="category"
            type="button"
            size="sm"
            :variant="commandFilter === category ? 'default' : 'outline'"
            class="shrink-0"
            @click="commandFilter = category"
          >
            {{ categoryLabels[category] }}
          </Button>
        </div>
      </div>
      <CommandList class="max-h-[24rem] px-1 pb-1">
        <CommandEmpty class="py-8 text-muted-foreground">没有找到匹配的工具</CommandEmpty>
        <CommandGroup :heading="commandFilterLabel">
          <div
            v-if="commandTools.length === 0"
            class="mx-2 my-2 rounded-md border border-border/70 bg-background/55 px-3 py-4"
          >
            <p class="text-sm font-medium text-foreground">{{ commandEmptyMessage }}</p>
            <p class="mt-1 text-xs leading-5 text-muted-foreground">{{ commandEmptyHint }}</p>
          </div>
          <CommandItem
            v-for="tool in commandTools"
            :key="tool.id"
            :value="`${tool.title} ${tool.description} ${categoryLabels[tool.category]} ${tool.keywords.join(' ')}`"
            class="gap-3 rounded-md px-3 py-2.5"
            @select="navigateToTool(tool.path)"
            @click="navigateToTool(tool.path)"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded border border-border/65 bg-background/55 text-primary">
              <component :is="getToolIcon(tool.id)" class="h-4 w-4" />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium">{{ tool.title }}</span>
              <span class="block truncate text-xs text-muted-foreground">{{ tool.description }}</span>
              <span class="sr-only">
                {{ categoryLabels[tool.category] }} {{ tool.keywords.join(' ') }}
              </span>
            </span>
            <Badge variant="secondary" class="ml-auto">{{ categoryCodes[tool.category] }}</Badge>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </div>
</template>
