import { chromium, devices } from 'playwright'
import fs from 'fs'
import path from 'path'

const outDir = 'scripts/mobile-check'
fs.mkdirSync(outDir, { recursive: true })

const viewports = [
  { name: 'iphone-se', device: devices['iPhone SE'] },
  { name: 'iphone-12', device: devices['iPhone 12'] },
  { name: 'pixel-5', device: devices['Pixel 5'] },
  {
    name: 'narrow-360',
    device: {
      viewport: { width: 360, height: 740 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 8.0) AppleWebKit/537.36 Mobile Safari/537.36',
    },
  },
]

const browser = await chromium.launch({ headless: true })
const report = []

for (const { name, device } of viewports) {
  const context = await browser.newContext(device)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message || e)))

  await page.goto('http://127.0.0.1:5175/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForSelector('h1', { timeout: 15000 })
  await page.waitForTimeout(2500)

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement
    const body = document.body
    const overflowX =
      Math.max(doc.scrollWidth, body.scrollWidth) - Math.max(doc.clientWidth, body.clientWidth)

    const cards = [...document.querySelectorAll('[data-mission]')].map((el) => {
      const r = el.getBoundingClientRect()
      return {
        id: el.getAttribute('data-mission'),
        overflow: r.right > window.innerWidth + 1 || r.left < -1,
      }
    })

    const stampsOut = [...document.querySelectorAll('[data-mission] button')].filter((b) => {
      const r = b.getBoundingClientRect()
      return r.right > window.innerWidth + 2 || r.left < -2
    }).length

    const lock = document.querySelector('button[aria-label*="사령관"]')
    const lockRect = lock?.getBoundingClientRect()
    const canvas = document.querySelector('canvas')
    const stage = canvas?.parentElement
    const stageRect = stage?.getBoundingClientRect()
    const status = document.querySelector('header')
    const firstMission = document.querySelector('[data-mission]')
    const missionSection = firstMission?.closest('section')

    return {
      inner: { w: window.innerWidth, h: window.innerHeight },
      overflowX,
      scrollH: Math.max(doc.scrollHeight, body.scrollHeight),
      cardOverflowCount: cards.filter((c) => c.overflow).length,
      stampsOut,
      lockBottomGap: lockRect ? Math.round(window.innerHeight - lockRect.bottom) : null,
      stageFits: stageRect ? stageRect.width <= window.innerWidth + 1 : null,
      stageSize: stageRect
        ? { w: Math.round(stageRect.width), h: Math.round(stageRect.height) }
        : null,
      statusBottom: status ? Math.round(status.getBoundingClientRect().bottom) : null,
      missionsNeedScroll: firstMission
        ? firstMission.getBoundingClientRect().top > window.innerHeight - 48
        : null,
      missionPadBottom: missionSection
        ? Number.parseFloat(getComputedStyle(missionSection).paddingBottom)
        : null,
    }
  })

  await page.screenshot({ path: path.join(outDir, `${name}-top.png`), fullPage: false })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(outDir, `${name}-bottom.png`), fullPage: false })

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: '상점' }).click()
  await page.waitForSelector('text=보상 상점', { timeout: 8000 })
  await page.waitForTimeout(400)
  const shopOk = await page.evaluate(() => {
    const h2 = [...document.querySelectorAll('h2')].find((h) =>
      (h.textContent || '').includes('보상 상점'),
    )
    const panel = h2?.parentElement
    const r = panel?.getBoundingClientRect()
    if (!r) return { found: false }
    return {
      found: true,
      fits:
        r.width <= window.innerWidth + 2 &&
        r.left >= -2 &&
        r.bottom <= window.innerHeight + 8,
      w: Math.round(r.width),
      h: Math.round(r.height),
    }
  })
  await page.screenshot({ path: path.join(outDir, `${name}-shop.png`), fullPage: false })

  report.push({ name, metrics, shopOk, errors })
  console.log('done', name, JSON.stringify({ metrics, shopOk, errors }))
  await context.close()
}

await browser.close()
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log('ALL_OK')
