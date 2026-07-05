import { expect, test } from '@playwright/test'

test('shows contextual JSON output guidance before running an action', async ({ page }) => {
  await page.goto('/#/tools/json')

  await expect(page.getByText('格式化、压缩或校验后，结果会留在本机浏览器。')).toBeVisible()
})

test('filters command palette by category', async ({ page }) => {
  await page.goto('/#/tools/json')

  await page.getByRole('button', { name: '搜索工具' }).first().click()
  await page.getByRole('button', { name: '安全' }).click()

  const palette = page.getByRole('dialog')
  await expect(palette.getByText('JWT 解码')).toBeVisible()
  await expect(palette.getByText('哈希生成')).toBeVisible()
  await expect(palette.getByText('Base64 编解码')).toBeHidden()
})

test('shows a useful command palette empty state for filters with no tools', async ({ page }) => {
  await page.goto('/#/tools/json')

  await page.getByRole('button', { name: '搜索工具' }).first().click()
  await page.getByRole('button', { name: '收藏' }).click()

  await expect(page.getByRole('dialog').getByText('还没有收藏工具')).toBeVisible()
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

test('announces hash generation results to assistive technology', async ({ page }) => {
  await page.goto('/#/tools/hash')

  await page.getByLabel('哈希输入').fill('hello')
  await page.getByRole('button', { name: '生成哈希' }).click()

  await expect(page.getByTestId('tool-announcer')).toContainText('SHA-256 摘要已生成')
})
