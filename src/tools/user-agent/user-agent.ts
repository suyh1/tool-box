export interface UserAgentDetails {
  browser: {
    name: string
    version: string
  }
  engine: {
    name: string
    version: string
  }
  os: {
    name: string
    version: string
  }
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'
    model: string
  }
}

function firstMatch(input: string, pattern: RegExp) {
  return input.match(pattern)?.[1] ?? ''
}

function parseBrowser(input: string) {
  if (/Edg\//u.test(input)) {
    return { name: 'Edge', version: firstMatch(input, /Edg\/([\d.]+)/u) }
  }

  if (/Chrome\//u.test(input) && !/Chromium\//u.test(input)) {
    return { name: 'Chrome', version: firstMatch(input, /Chrome\/([\d.]+)/u) }
  }

  if (/Firefox\//u.test(input)) {
    return { name: 'Firefox', version: firstMatch(input, /Firefox\/([\d.]+)/u) }
  }

  if (/Version\/[\d.]+.*Safari\//u.test(input)) {
    return { name: 'Safari', version: firstMatch(input, /Version\/([\d.]+)/u) }
  }

  return { name: 'Unknown', version: '' }
}

function parseEngine(input: string, browserName: string) {
  if (browserName === 'Chrome' || browserName === 'Edge') {
    return { name: 'Blink', version: firstMatch(input, /AppleWebKit\/([\d.]+)/u) }
  }

  if (browserName === 'Safari') {
    return { name: 'WebKit', version: firstMatch(input, /AppleWebKit\/([\d.]+)/u) }
  }

  if (browserName === 'Firefox') {
    return { name: 'Gecko', version: firstMatch(input, /Gecko\/([\d.]+)/u) }
  }

  return { name: 'Unknown', version: '' }
}

function parseOs(input: string) {
  if (/Mac OS X/u.test(input)) {
    return { name: 'macOS', version: firstMatch(input, /Mac OS X ([\d_]+)/u).replace(/_/g, '.') }
  }

  if (/Windows NT/u.test(input)) {
    return { name: 'Windows', version: firstMatch(input, /Windows NT ([\d.]+)/u) }
  }

  if (/Android/u.test(input)) {
    return { name: 'Android', version: firstMatch(input, /Android ([\d.]+)/u) }
  }

  if (/(iPhone|iPad).*OS/u.test(input)) {
    return { name: 'iOS', version: firstMatch(input, /OS ([\d_]+)/u).replace(/_/g, '.') }
  }

  if (/Linux/u.test(input)) {
    return { name: 'Linux', version: '' }
  }

  return { name: 'Unknown', version: '' }
}

function parseDevice(input: string): UserAgentDetails['device'] {
  if (/bot|crawler|spider/iu.test(input)) {
    return { type: 'bot', model: '' }
  }

  if (/iPad|Tablet/iu.test(input)) {
    return { type: 'tablet', model: firstMatch(input, /(iPad|Tablet)/iu) }
  }

  if (/Mobile|iPhone|Android/iu.test(input)) {
    return { type: 'mobile', model: firstMatch(input, /(iPhone|Android)/iu) }
  }

  if (/Macintosh|Windows|Linux/iu.test(input)) {
    return { type: 'desktop', model: '' }
  }

  return { type: 'unknown', model: '' }
}

export function parseUserAgent(input: string): UserAgentDetails {
  const browser = parseBrowser(input)

  return {
    browser,
    engine: parseEngine(input, browser.name),
    os: parseOs(input),
    device: parseDevice(input),
  }
}
