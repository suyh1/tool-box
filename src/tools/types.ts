import type { Component } from 'vue'

export type ToolStatus = 'active' | 'planned'
export type ToolPrivacy = 'local' | 'network-on-action'

export type ToolCategory =
  | 'format'
  | 'encode'
  | 'time'
  | 'security'
  | 'generate'
  | 'code'
  | 'text'

export type ToolComponentLoader = () => Promise<{ default: Component }>

export interface ToolDefinition {
  id: string
  title: string
  description: string
  path: string
  category: ToolCategory
  group?: string
  keywords: string[]
  aliases?: string[]
  featured?: boolean
  order?: number
  status: ToolStatus
  privacy: ToolPrivacy
  component: ToolComponentLoader
}
