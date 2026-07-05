import { expect, test } from '@playwright/test'

test('formats valid JSON', async ({ page }) => {
  await page.goto('/#/tools/json')
  await page.getByLabel('JSON 输入').fill('{"name":"Toolbox","enabled":true}')
  await page.getByRole('button', { name: '格式化 JSON' }).click()

  await expect(page.getByLabel('JSON 输出')).toHaveValue('{\n  "name": "Toolbox",\n  "enabled": true\n}')
  await expect(page.getByText('对象，2 个键')).toBeVisible()
})

test('shows invalid JSON errors', async ({ page }) => {
  await page.goto('/#/tools/json')
  await page.getByLabel('JSON 输入').fill('{"name":}')
  await page.getByRole('button', { name: '格式化 JSON' }).click()

  await expect(page.getByText(/JSON 无效/)).toBeVisible()
})
