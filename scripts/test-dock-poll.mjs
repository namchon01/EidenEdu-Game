import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 430, height: 900 } })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })

await page.getByRole('button', { name: '모든 미션 보기' }).click()
await page.getByRole('button', { name: /존댓말 쓰기/ }).click()
await page.getByRole('button', { name: '했어!' }).click()
await page.waitForTimeout(400)

await page.getByRole('button', { name: /일기·편지 쓰기/ }).click()

// Click and immediately poll for overlay
const clickPromise = page.getByRole('button', { name: '했어!' }).click()
await clickPromise

for (let i = 0; i < 20; i++) {
  const count = await page.getByText('찰칵!').count()
  const visible = count > 0 && (await page.getByText('찰칵!').first().isVisible())
  console.log(`t=${i * 100}ms count=${count} visible=${visible}`)
  if (visible) {
    await page.screenshot({ path: `/opt/cursor/artifacts/dock_frame_${i}.png` })
  }
  await page.waitForTimeout(100)
}

await page.screenshot({ path: '/opt/cursor/artifacts/playwright_final.png', fullPage: true })
await browser.close()
