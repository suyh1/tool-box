import { expect, test } from '@playwright/test'

test('shows contextual JSON output guidance before running an action', async ({ page }) => {
  await page.goto('/#/tools/json')

  await expect(page.getByText('格式化、压缩或校验后，结果会留在本机浏览器。')).toBeVisible()
})

test('filters command palette by category', async ({ page }) => {
  await page.goto('/#/tools/json')

  await page.getByRole('button', { name: '搜索工具' }).first().click()
  const filters = page.getByRole('radiogroup', { name: '命令面板筛选' })
  const securityFilter = filters.getByRole('radio', { name: '安全' })
  await securityFilter.click()

  const palette = page.getByRole('dialog')
  await expect(securityFilter).toBeChecked()
  await expect(filters.getByRole('radio', { name: '全部' })).not.toBeChecked()
  await expect(palette.getByText('JWT 工作台')).toBeVisible()
  await expect(palette.getByText('Hash / HMAC')).toBeVisible()
  await expect(palette.getByText('Base64 编解码')).toBeHidden()
})

test('keeps merged workbenches discoverable through legacy keywords', async ({ page }) => {
  await page.goto('/#/tools/json')

  await page.getByRole('button', { name: '搜索工具' }).first().click()
  await page.getByPlaceholder('搜索 JSON、JWT、哈希、正则...').fill('jwt sign')

  const palette = page.getByRole('dialog')
  await expect(palette.getByText('JWT 工作台')).toBeVisible()
})

test('marks recent and favorite directory views as the current navigation item', async ({ page }) => {
  await page.goto('/#/tools?view=recent')

  await expect(page.getByRole('link', { name: /最近使用/ })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('link', { name: /工具目录/ })).not.toHaveAttribute('aria-current', 'page')

  await page.goto('/#/tools?view=favorites')

  await expect(page.getByRole('link', { name: /收藏工具/ })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('link', { name: /工具目录/ })).not.toHaveAttribute('aria-current', 'page')
})

test('offers a skip link and focuses the page title after route changes', async ({ page }) => {
  await page.goto('/#/tools')

  const skipLink = page.getByRole('link', { name: '跳到主内容' })
  await expect(skipLink).toBeAttached()
  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: '工具目录', level: 1 })).toBeFocused()

  await page.getByRole('link', { name: /编码/ }).first().click()

  await expect(page.getByRole('heading', { name: '编码工具', level: 1 })).toBeFocused()
})

test('prioritizes tool content over the full sidebar on mobile routes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only layout check')

  await page.goto('/#/tools/json')

  await expect(page.getByRole('heading', { name: 'JSON 格式化', level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '工具导航' })).toBeHidden()

  await page.getByRole('button', { name: '打开工具导航' }).click()
  await expect(page.getByRole('dialog', { name: '工具导航' })).toBeVisible()
})

test('keeps visible buttons at comfortable touch targets on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only touch target check')

  await page.goto('/#/tools/json')

  const smallButtons = await page.locator('[data-slot="button"]:visible').evaluateAll((buttons) => buttons
    .map((button) => {
      const box = button.getBoundingClientRect()
      return {
        label: button.getAttribute('aria-label') ?? button.textContent?.trim() ?? 'button',
        width: Math.round(box.width),
        height: Math.round(box.height),
      }
    })
    .filter((box) => box.width < 40 || box.height < 40))

  expect(smallButtons).toEqual([])
})

test('distinguishes local-only tools from tools that connect on action', async ({ page }) => {
  await page.goto('/#/tools/json')
  await expect(page.getByText('本地处理')).toBeVisible()

  await page.goto('/#/tools/dns-query')
  await expect(page.getByText('按操作联网')).toBeVisible()
})

test('shows network privacy status in tool dialogs', async ({ page }) => {
  await page.goto('/#/tools/category/code')

  const dnsCard = page.getByRole('button', { name: /DNS 查询/ }).first()
  await expect(dnsCard).toContainText('点击后联网')

  await dnsCard.click()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('点击后联网')).toBeVisible()
  await expect(dialog.getByText('本地可用')).toBeHidden()
})

test('shows a useful command palette empty state for filters with no tools', async ({ page }) => {
  await page.goto('/#/tools/json')

  await page.getByRole('button', { name: '搜索工具' }).first().click()
  await page.getByRole('radio', { name: '收藏' }).click()

  await expect(page.getByRole('dialog').getByText('还没有收藏工具')).toBeVisible()
})

test('keeps tool dialog favorite and close controls comfortably separated', async ({ page }) => {
  await page.goto('/#/tools')

  await page.getByRole('button', { name: /JSON 格式化/ }).first().click()

  const dialog = page.getByRole('dialog')
  const favoriteButton = dialog.getByRole('button', { name: /收藏/ })
  const closeButton = dialog.getByRole('button', { name: '关闭' })

  await expect(favoriteButton).toBeVisible()
  await expect(closeButton).toBeVisible()

  const favoriteBox = await favoriteButton.boundingBox()
  const closeBox = await closeButton.boundingBox()

  expect(favoriteBox).not.toBeNull()
  expect(closeBox).not.toBeNull()

  const horizontalGap = Math.abs(closeBox!.x - (favoriteBox!.x + favoriteBox!.width))
  expect(horizontalGap).toBeGreaterThanOrEqual(32)
})

test('announces JSON action results to assistive technology', async ({ page }) => {
  await page.goto('/#/tools/json')

  await page.getByLabel('JSON 输入').fill('{"name":"Toolbox","enabled":true}')
  await page.getByRole('button', { name: '格式化 JSON' }).click()

  await expect(page.getByTestId('tool-announcer')).toContainText('JSON 已格式化')
})

test('shows contextual hash guidance before generating an output', async ({ page }) => {
  await page.goto('/#/tools/hash')

  await expect(page.getByText('生成 SHA 摘要后会显示十六进制输出，内容不离开浏览器。')).toBeVisible()
})

test('shows crypto safety guidance for sensitive tools', async ({ page }) => {
  await page.goto('/#/tools/aes')
  await expect(page.getByText('同一 AES-GCM key 下 IV 不得重复。')).toBeVisible()

  await page.goto('/#/tools/totp')
  await expect(page.getByLabel('TOTP Base32 secret')).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: '显示 TOTP secret' }).click()
  await expect(page.getByLabel('TOTP Base32 secret')).toHaveAttribute('type', 'text')
  await expect(page.getByText('SHA-1 是 TOTP 的兼容默认值；新系统优先选择 SHA-256 或 SHA-512。')).toBeVisible()

  await page.goto('/#/tools/hash')
  await page.getByLabel('哈希算法').selectOption('SHA-1')
  await expect(page.getByText('SHA-1 仅用于兼容旧校验，不适合安全用途。')).toBeVisible()

  await page.goto('/#/tools/jwt')
  await page.getByRole('tab', { name: '签名 / 验签' }).click()
  await expect(page.getByLabel('JWT HMAC 密钥')).not.toHaveValue('secret')
  await expect(page.getByText('示例密钥只适合本地演示，生产 JWT 必须使用高熵密钥。')).toBeVisible()
})

test('shows clipboard privacy guidance near copy actions', async ({ page }) => {
  await page.goto('/#/tools/json')

  await expect(page.getByText('复制会写入系统剪贴板，其他应用可能读取。')).toBeVisible()
})

test('announces hash generation results to assistive technology', async ({ page }) => {
  await page.goto('/#/tools/hash')

  await page.getByLabel('哈希输入').fill('hello')
  await page.getByRole('button', { name: '生成哈希' }).click()

  await expect(page.getByTestId('tool-announcer')).toContainText('SHA-256 摘要已生成')
})

test('announces clipboard write failures instead of reporting a false copy success', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('permission denied')
        },
      },
    })
  })
  await page.goto('/#/tools/json')

  await page.getByLabel('JSON 输入').fill('{"name":"Toolbox"}')
  await page.getByRole('button', { name: '格式化 JSON' }).click()
  await page.getByRole('button', { name: '复制输出' }).click()

  await expect(page.getByTestId('tool-announcer')).toContainText('复制失败')
})
