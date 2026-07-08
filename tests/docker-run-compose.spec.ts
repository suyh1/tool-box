import { expect, test } from '@playwright/test'

test('converts docker compose yaml to docker run commands', async ({ page }) => {
  await page.goto('/#/tools/docker-run-compose')

  await page.getByLabel('Docker Compose YAML').fill(`services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production`)
  await page.getByRole('button', { name: '转换' }).click()

  await expect(page.getByLabel('docker run 输出')).toHaveValue(/docker run -d --name web -p 8080:80 --env NODE_ENV=production nginx:alpine/)
})

test('converts docker run commands to compose yaml', async ({ page }) => {
  await page.goto('/#/tools/docker-run-compose')

  await page.getByRole('button', { name: 'docker run -> Compose' }).click()
  await page.getByLabel('docker run 命令').fill('docker run --name web -p 8080:80 -e NODE_ENV=production nginx:alpine')
  await page.getByRole('button', { name: '转换' }).click()

  await expect(page.getByLabel('Compose YAML 输出')).toHaveValue(/services:\n\s+web:\n\s+container_name: web\n\s+ports:\n\s+- 8080:80\n\s+environment:\n\s+NODE_ENV: production\n\s+image: nginx:alpine/)
})

test('shows warnings for lossy compose fields', async ({ page }) => {
  await page.goto('/#/tools/docker-run-compose')

  await page.getByLabel('Docker Compose YAML').fill(`services:
  app:
    build: .
    image: app:local
    depends_on:
      - db`)
  await page.getByRole('button', { name: '转换' }).click()

  await expect(page.getByLabel('转换提示')).toContainText('build')
  await expect(page.getByLabel('转换提示')).toContainText('depends_on')
})

test('keeps the converter discoverable through command palette keywords', async ({ page }) => {
  await page.goto('/#/tools/json')

  await page.getByRole('button', { name: '搜索工具' }).first().click()
  await page.getByPlaceholder('搜索 JSON、JWT、哈希、正则...').fill('container run')

  await expect(page.getByRole('dialog').getByText('Docker Run / Compose 互换')).toBeVisible()
})
