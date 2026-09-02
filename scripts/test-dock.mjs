import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 430, height: 900 } })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.clear()
})
await page.reload({ waitUntil: 'networkidle' })

await page.getByRole('button', { name: '모든 미션 보기' }).click()
await page.getByRole('button', { name: /존댓말 쓰기/ }).click()
await page.getByRole('button', { name: '했어!' }).click()
await page.waitForTimeout(500)

await page.getByRole('button', { name: /일기·편지 쓰기/ }).click()
await page.getByRole('button', { name: '했어!' }).click()

// Check for docking overlay text
const overlay = page.getByText('찰칵!')
const visible = await overlay.isVisible().catch(() => false)
console.log('dock_overlay_visible=', visible)

const energy = await page.locator('header').innerText()
console.log('header=', energy.replace(/\n/g, ' | '))

const storage = await page.evaluate(() => localStorage.getItem('robot-habit-hangar-v1'))
console.log('storage_parts=', storage && JSON.parse(storage).parts)
console.log('storage_pieces=', storage && JSON.parse(storage).partPieces)

await page.screenshot({ path: '/opt/cursor/artifacts/playwright_after_dock.png', fullPage: true })

// Wait and check again during 2s window
await page.waitForTimeout(300)
const still = await overlay.isVisible().catch(() => false)
console.log('dock_overlay_after_300ms=', still)

await page.screenshot({ path: '/opt/cursor/artifacts/playwright_dock_300ms.png', fullPage: true })

await browser.close()
