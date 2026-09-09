import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.APP_URL ?? 'http://localhost:5174/'
const OUT = join(tmpdir(), 'eidenedu-shots')
mkdirSync(OUT, { recursive: true })

const PART_IDS = ['feet', 'legs', 'body', 'arms', 'head', 'shield', 'booster']
const MISSION_IDS = [
  'eatWell',
  'tidy',
  'polite',
  'noTantrum',
  'homework',
  'helpParents',
  'diary',
]

const browser = await chromium.launch({
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 430, height: 940 } })
// Software WebGL in CI-style headless runs is slow, so give every step room.
page.setDefaultTimeout(120_000)

const problems = []
page.on('console', (msg) => {
  if (msg.type() === 'error') problems.push(`console: ${msg.text()}`)
})
page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`))

const readState = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem('robot-habit-hangar-v1') ?? '{}'))

const dockedParts = (state) => PART_IDS.filter((p) => state.parts?.[p] === 1)

const frame = () => page.locator('canvas').locator('..')

/**
 * Percentage of clearly red pixels in a patch of the render. A docked part uses
 * the solid red armour while an unearned one is a pale cyan hologram, so this
 * catches a part that silently stays see-through after its mission is finished.
 * Counting pixels rather than averaging keeps it stable while the robot sways.
 */
async function redPercent(region) {
  const shot = await frame().screenshot()
  return page.evaluate(
    async ({ dataUrl, box }) => {
      const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob())
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(bitmap, 0, 0)
      const x = Math.round(bitmap.width * box.x0)
      const y = Math.round(bitmap.height * box.y0)
      const w = Math.round(bitmap.width * (box.x1 - box.x0))
      const h = Math.round(bitmap.height * (box.y1 - box.y0))
      const { data } = ctx.getImageData(x, y, w, h)
      let red = 0
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
        if (r > 105 && r - Math.max(g, b) > 40) red += 1
      }
      return Math.round((red / (data.length / 4)) * 100)
    },
    { dataUrl: `data:image/png;base64,${shot.toString('base64')}`, box: region },
  )
}

// Band across the chest, as a fraction of the 3D frame.
const TORSO = { x0: 0.3, y0: 0.28, x1: 0.7, y1: 0.52 }

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

const canvasCount = await page.locator('canvas').count()
console.log('canvas_count=', canvasCount)
console.log('hologram_torso_red_pct=', await redPercent(TORSO))
await page.screenshot({ path: join(OUT, '01-hologram.png'), fullPage: true })

const missionOrder = () => page.locator('[data-mission]').evaluateAll((els) => els.map((el) => el.getAttribute('data-mission')))

const expandAll = async () => {
  const expand = page.getByRole('button', { name: /모든 미션 보기/ })
  if (await expand.isVisible().catch(() => false)) {
    await expand.click()
    await page.waitForTimeout(400)
  }
}

await expandAll()

const eatCard = page.locator('[data-mission="eatWell"]')
const tidyCard = page.locator('[data-mission="tidy"]')
const eatStamps = eatCard.getByRole('button', { name: /골고루 먹기 \d번째 도장/ })
console.log('stamp_buttons_on_first_card=', await eatStamps.count())
const orderBefore = await missionOrder()
console.log('card_order_before=', orderBefore.join('|'))

await eatStamps.nth(0).click()
await page.waitForTimeout(400)
await eatStamps.nth(1).click()
await page.waitForTimeout(400)
await eatCard.screenshot({ path: join(OUT, '02-stamps-2of3.png') })
console.log('almost_hint_visible=', await eatCard.getByText('한 끼만 더').isVisible().catch(() => false))

await eatStamps.nth(2).click()
await page.waitForTimeout(2600)

let state = await readState()
console.log('after_three_stamps_progress=', JSON.stringify(state.missionProgress))
console.log('after_three_stamps_parts=', dockedParts(state).join(','))
console.log('after_three_stamps_energy=', state.energy)
console.log(
  'stamps_independent=',
  state.missionProgress?.eatWell === 3 &&
    MISSION_IDS.every((id) => id === 'eatWell' || (state.missionProgress?.[id] ?? 0) === 0),
)
const orderAfter = await missionOrder()
console.log('card_order_unchanged=', orderAfter.join('|') === orderBefore.join('|'))
console.log('completed_card_copy=', await eatCard.getByText('도장 3개 완성!').isVisible())
console.log('docked_torso_red_pct=', await redPercent(TORSO))
await page.screenshot({ path: join(OUT, '03-first-part-docked.png'), fullPage: true })

// A stamp on a second mission must not touch the first.
await tidyCard.getByRole('button', { name: /장난감 정리 1번째 도장 찍기/ }).click()
await page.waitForTimeout(400)
state = await readState()
console.log(
  'second_mission_isolated=',
  state.missionProgress?.eatWell === 3 && state.missionProgress?.tidy === 1,
)
console.log('card_order_after_second=', (await missionOrder()).join('|') === orderBefore.join('|'))

// --- Deduct: tapping a filled stamp must pop the part back off. ---
await eatCard.getByRole('button', { name: /골고루 먹기 3번째 도장 되돌리기/ }).click()
await page.waitForTimeout(1800)
state = await readState()
console.log('after_deduct_progress=', state.missionProgress?.eatWell)
console.log('after_deduct_tidy_untouched=', state.missionProgress?.tidy)
console.log('after_deduct_parts=', dockedParts(state).join(',') || '(none)')
console.log('after_deduct_torso_red_pct=', await redPercent(TORSO))
await page.screenshot({ path: join(OUT, '04-part-removed.png'), fullPage: true })

// --- Shop: message board plus the mission progress summary. ---
await page.getByRole('button', { name: '상점' }).click()
await page.waitForTimeout(700)
console.log('shop_message_board=', await page.getByText('정비사 통신').isVisible())
console.log('shop_progress_section=', await page.getByText('미션 진행').isVisible())
await page.screenshot({ path: join(OUT, '05-shop.png') })
await page.getByRole('button', { name: '닫기' }).click()
await page.waitForTimeout(400)

// --- Fill every mission so all seven parts assemble and the ceremony fires. ---
await page.evaluate((missions) => {
  const key = 'robot-habit-hangar-v1'
  const state = JSON.parse(localStorage.getItem(key) ?? '{}')
  state.missionProgress = Object.fromEntries(missions.map((id) => [id, 3]))
  state.parts = {
    feet: 1,
    legs: 1,
    body: 1,
    arms: 1,
    head: 1,
    shield: 1,
    booster: 1,
  }
  state.energy = 100
  state.heroCelebrated = true
  localStorage.setItem(key, JSON.stringify(state))
}, MISSION_IDS)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(3000)

state = await readState()
console.log('all_parts_docked=', dockedParts(state).length)
await page.screenshot({ path: join(OUT, '06-assembled.png'), fullPage: true })

const box = await page.locator('canvas').boundingBox()
console.log('canvas_box=', box && { w: Math.round(box.width), h: Math.round(box.height) })

await page.getByRole('button', { name: '분해' }).click()
await page.waitForTimeout(1800)
await page.screenshot({ path: join(OUT, '07-exploded.png') })

// Orbit from an empty corner so the lower parts are clearly visible.
await page.mouse.move(box.x + box.width * 0.08, box.y + box.height * 0.5)
await page.mouse.down()
await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.34, { steps: 14 })
await page.mouse.up()
await page.waitForTimeout(1200)
await page.screenshot({ path: join(OUT, '07b-exploded-orbit.png') })

const rebuild = page.getByRole('button', { name: '조립' })
if (await rebuild.isVisible().catch(() => false)) {
  await rebuild.click()
  await page.waitForTimeout(1800)
}
await page.screenshot({ path: join(OUT, '08-rebuilt.png') })

// Tap the head to check single-part detach, then drag it aside.
await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.24)
await page.waitForTimeout(900)
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.2)
await page.mouse.down()
await page.mouse.move(box.x + box.width * 0.76, box.y + box.height * 0.32, { steps: 18 })
await page.mouse.up()
await page.waitForTimeout(900)
await page.screenshot({ path: join(OUT, '09-dragged.png') })

// --- Ceremony: completing the last mission must show the hero launch. ---
await page.evaluate((missions) => {
  const key = 'robot-habit-hangar-v1'
  const state = JSON.parse(localStorage.getItem(key) ?? '{}')
  state.missionProgress = Object.fromEntries(missions.map((id) => [id, 3]))
  state.missionProgress.diary = 2
  state.parts = { feet: 1, legs: 1, body: 1, arms: 1, head: 1, shield: 1, booster: 0 }
  state.heroCelebrated = false
  localStorage.setItem(key, JSON.stringify(state))
}, MISSION_IDS)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(2600)
await expandAll()
await page.getByRole('button', { name: /일기·편지 쓰기 3번째 도장 찍기/ }).click()
await page.waitForTimeout(500)
await page.locator('[data-mission="diary"]').screenshot({
  path: join(OUT, '09b-card-completed.png'),
})
await page.waitForTimeout(5000)
console.log('hero_ceremony_visible=', await page.getByText('출동!').isVisible().catch(() => false))
console.log(
  'hero_reward_button_visible=',
  await page
    .getByRole('button', { name: '보상 받으러 가기' })
    .isVisible()
    .catch(() => false),
)
await page.screenshot({ path: join(OUT, '10-hero.png') })

const audioState = await page.evaluate(() => {
  const AC = window.AudioContext ?? window.webkitAudioContext
  return typeof AC === 'function'
})
console.log('audio_api_available=', audioState)

console.log('problem_count=', problems.length)
for (const p of problems.slice(0, 12)) console.log(' -', p)
console.log('screenshots_in=', OUT)

await browser.close()

