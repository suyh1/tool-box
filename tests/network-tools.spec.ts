import { expect, test } from '@playwright/test'

test('queries DNS through a mocked DoH response', async ({ page }) => {
  await page.route('https://cloudflare-dns.com/dns-query?*', async (route) => {
    await route.fulfill({
      contentType: 'application/dns-json',
      json: {
        Status: 0,
        Answer: [
          {
            name: 'example.com',
            type: 1,
            TTL: 300,
            data: '93.184.216.34',
          },
        ],
      },
    })
  })

  await page.goto('/#/tools/dns-query')
  await page.getByLabel('DNS 查询域名').fill('example.com')
  await page.getByRole('button', { name: '查询 DNS' }).click()

  await expect(page.getByTestId('tool-announcer')).toContainText('DNS 查询完成')
  await expect(page.getByLabel('DNS 查询输出')).toHaveValue(/93\.184\.216\.34/)
  await expect(page.getByLabel('DNS 查询输出')).toHaveValue(/cloudflare-dns\.com/)
})

test('sends and receives WebSocket messages with a mocked socket', async ({ page }) => {
  await page.addInitScript(() => {
    class MockWebSocket extends EventTarget {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3

      readyState = MockWebSocket.CONNECTING

      constructor(
        public url: string,
        public protocols: string[] = [],
      ) {
        super()
        setTimeout(() => {
          this.readyState = MockWebSocket.OPEN
          this.dispatchEvent(new Event('open'))
        })
      }

      send(data: string) {
        setTimeout(() => {
          this.dispatchEvent(new MessageEvent('message', { data: `echo:${data}` }))
        })
      }

      close() {
        this.readyState = MockWebSocket.CLOSED
        this.dispatchEvent(new CloseEvent('close'))
      }
    }

    window.WebSocket = MockWebSocket as unknown as typeof WebSocket
  })

  await page.goto('/#/tools/websocket-echo')
  await page.getByLabel('WebSocket URL').fill('wss://mock.local/socket')
  await page.getByLabel('WebSocket message').fill('ping')
  await page.getByRole('button', { name: '连接' }).click()

  await expect(page.getByLabel('WebSocket transcript')).toHaveValue(/\[status\] connected/)

  await page.getByRole('button', { name: '发送' }).click()

  await expect(page.getByLabel('WebSocket transcript')).toHaveValue(/\[sent\] ping/)
  await expect(page.getByLabel('WebSocket transcript')).toHaveValue(/\[received\] echo:ping/)
})
