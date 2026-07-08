import type { ToolPrivacy } from './types'

export function getToolPrivacyLabel(privacy: ToolPrivacy) {
  return privacy === 'network-on-action' ? '点击后联网' : '本地处理'
}
