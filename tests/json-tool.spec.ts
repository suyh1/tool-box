import { expect, test } from '@playwright/test'

test('formats valid JSON', async ({ page }) => {
  await page.goto('/#/tools/json')
  await page.getByLabel('JSON input').fill('{"name":"Toolbox","enabled":true}')
  await page.getByRole('button', { name: 'Format JSON' }).click()

  await expect(page.getByLabel('JSON output')).toHaveValue('{\n  "name": "Toolbox",\n  "enabled": true\n}')
  await expect(page.getByText('Object with 2 keys')).toBeVisible()
})

test('shows invalid JSON errors', async ({ page }) => {
  await page.goto('/#/tools/json')
  await page.getByLabel('JSON input').fill('{"name":}')
  await page.getByRole('button', { name: 'Format JSON' }).click()

  await expect(page.getByText(/Invalid JSON/)).toBeVisible()
})
