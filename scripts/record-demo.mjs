import { chromium } from 'playwright'
import { execSync } from 'node:child_process'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 430, height: 900 },
  recordVideo: { dir: '/tmp/pw-video', size: { width: 430, height: 900 } },
})
const page = await context.newPage()
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(600)

await page.getByRole('button', { name: '모든 미션 보기' }).click()
await page.waitForTimeout(400)
await page.getByRole('button', { name: /존댓말 쓰기/ }).click()
await page.waitForTimeout(400)
await page.getByRole('button', { name: '했어!' }).click()
await page.waitForTimeout(900)

await page.getByRole('button', { name: /일기·편지 쓰기/ }).click()
await page.waitForTimeout(400)
await page.getByRole('button', { name: '했어!' }).click()
await page.waitForTimeout(2200)

// Open PIN via double-click on lock
const lock = page.getByRole('button', { name: /사령관 모드/ })
await lock.dblclick()
await page.waitForTimeout(500)
await page.getByRole('heading', { name: '사령관 PIN' }).waitFor({ timeout: 5000 })
await page.locator('input[inputmode="numeric"]').fill('1234')
await page.getByRole('button', { name: '입장' }).click()
await page.waitForTimeout(600)
await page.getByRole('button', { name: '2시간 냉각' }).click()
await page.waitForTimeout(900)
await page.getByRole('button', { name: '냉각 해제' }).click()
await page.waitForTimeout(500)
await page.getByRole('button', { name: '닫기' }).click()
await page.waitForTimeout(500)
await page.getByRole('button', { name: /^상점$/ }).click()
await page.waitForTimeout(1000)
await page.getByRole('button', { name: '닫기' }).click()
await page.waitForTimeout(500)

await context.close()
await browser.close()

const files = execSync('ls -t /tmp/pw-video/*.webm | head -1').toString().trim()
console.log('video=', files)
execSync(
  `ffmpeg -y -i "${files}" -c:v libx264 -pix_fmt yuv420p /opt/cursor/artifacts/docking_commander_demo.mp4`,
  { stdio: 'inherit' },
)
