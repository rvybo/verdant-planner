// Download all assets for all 69 zahony:
// - cover photo (_pohled)
// - plan image (_osz)
// - all plant photos
// - PDF
// Saves to: public/zahony/{id}/cover.jpg, plan.jpg, plants/*.jpg, plan.pdf

import { chromium } from 'playwright'
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'
import https from 'https'

const EMAIL    = process.env.Z_EMAIL
const PASS     = process.env.Z_PASS
const BASE     = 'https://zijtevesvezahrade.cz'
const OUT_ROOT = 'public/zahony'
const CHROMIUM = 'C:\\Users\\rvybostok\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe'

if (!EMAIL || !PASS) { console.error('Set Z_EMAIL and Z_PASS'); process.exit(1) }

// Load zahon IDs
const library = JSON.parse(readFileSync('data/zahon-library.json', 'utf8'))
const ids = library.map(z => z.id)
console.log(`📚 ${ids.length} záhonov na spracovanie`)

// Download helper using Node https (bypasses SSL cert issue)
let cookieHeader = ''

function downloadFile(url, destPath) {
  if (existsSync(destPath)) { console.log(`  ⏭  skip: ${basename(destPath)}`); return Promise.resolve(true) }
  return new Promise((resolve) => {
    const req = https.get(url, { rejectUnauthorized: false, headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, destPath).then(resolve)
      }
      if (res.statusCode !== 200) {
        console.log(`  ❌ HTTP ${res.statusCode}: ${basename(url)}`)
        res.resume()
        return resolve(false)
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        writeFileSync(destPath, buf)
        console.log(`  ✅ ${basename(destPath)} (${Math.round(buf.length/1024)}KB)`)
        resolve(true)
      })
    })
    req.on('error', e => { console.log(`  ❌ ${e.message}: ${basename(url)}`); resolve(false) })
  })
}

const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM })
const context = await browser.newContext({ ignoreHTTPSErrors: true })
const page    = await context.newPage()

// ── LOGIN ──────────────────────────────────────────────────
console.log('🔐 Prihlasovanie...')
await page.goto(`${BASE}/prihlaseni`, { waitUntil: 'domcontentloaded' })
await page.fill('#user_log', EMAIL)
await page.fill('#user_pass', PASS)
await page.click('#wp-submit')
await page.waitForLoadState('networkidle')
if (page.url().includes('prihlaseni')) { console.error('❌ Login zlyhal'); process.exit(1) }
console.log(`✅ Prihlásený: ${page.url()}`)

// Extract cookies for Node https downloads
const cookies = await context.cookies()
cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

// ── SCRAPE + DOWNLOAD ──────────────────────────────────────
const stats = { ok: 0, skip: 0, fail: 0 }

for (let i = 0; i < ids.length; i++) {
  const id  = ids[i]
  const dir = join(OUT_ROOT, id)
  mkdirSync(join(dir, 'plants'), { recursive: true })

  console.log(`\n[${i+1}/${ids.length}] ${id}`)

  try {
    await page.goto(`${BASE}/trvalky/${id}`, { waitUntil: 'networkidle', timeout: 30000 })

    if (page.url().includes('kurz') || page.url().includes('prihlaseni')) {
      console.log('  ⚠️  Presmerované na login/kurz - preskakujem')
      stats.fail++
      continue
    }

    // ── Collect all images ───────────────────────────────
    const imgUrls = await page.$$eval('img[src]', els =>
      els.map(e => e.src)
         .filter(s => s && !s.includes('data:') && !s.endsWith('.svg') && !s.includes('logo') && !s.includes('cart') && !s.includes('icon'))
    )

    // Categorise images
    const coverUrl  = imgUrls.find(u => u.includes('_pohled') || u.includes('-pohled'))
    const planImgUrl = imgUrls.find(u => u.includes('_osz') || u.includes('-osz'))
    const plantUrls = imgUrls.filter(u =>
      !u.includes('_pohled') && !u.includes('_osz') &&
      !u.includes('-pohled') && !u.includes('-osz') &&
      u.includes('wp-content/uploads') &&
      (u.includes('-415x280') || u.includes('415x280'))
    )
    // Any remaining wp-content uploads we haven't categorised
    const otherImgUrls = imgUrls.filter(u =>
      u.includes('wp-content/uploads') &&
      !u.includes('_pohled') && !u.includes('-pohled') &&
      !u.includes('_osz') && !u.includes('-osz') &&
      !plantUrls.includes(u)
    )

    // ── Download cover ───────────────────────────────────
    if (coverUrl) {
      const ext = extname(coverUrl).split('?')[0] || '.jpg'
      await downloadFile(coverUrl, join(dir, `cover${ext}`))
    } else {
      // Fallback: first wp-content image
      const fallback = imgUrls.find(u => u.includes('wp-content/uploads'))
      if (fallback) {
        const ext = extname(fallback).split('?')[0] || '.jpg'
        await downloadFile(fallback, join(dir, `cover${ext}`))
      } else {
        console.log('  ⚠️  Žiadna cover fotka')
      }
    }

    // ── Download plan image ──────────────────────────────
    if (planImgUrl) {
      const ext = extname(planImgUrl).split('?')[0] || '.jpg'
      await downloadFile(planImgUrl, join(dir, `plan-image${ext}`))
    }

    // ── Download plant photos ────────────────────────────
    for (const pUrl of plantUrls) {
      const fname = basename(pUrl).split('?')[0]
      await downloadFile(pUrl, join(dir, 'plants', fname))
    }

    // ── Any other garden images ──────────────────────────
    for (const u of otherImgUrls.slice(0, 5)) {
      const fname = basename(u).split('?')[0]
      if (!fname.match(/\.(jpg|jpeg|png|webp)$/i)) continue
      await downloadFile(u, join(dir, fname))
    }

    // ── Download PDF ─────────────────────────────────────
    const pdfLinks = await page.$$eval(
      'a[href*=".pdf"]',
      els => els.map(e => e.href)
    )
    const pdfUrl = pdfLinks[0]
    if (pdfUrl) {
      await downloadFile(pdfUrl, join(dir, 'plan.pdf'))
    } else {
      console.log('  ⚠️  PDF nenájdené')
    }

    stats.ok++
  } catch (e) {
    console.log(`  ❌ Chyba: ${e.message}`)
    stats.fail++
  }
}

await browser.close()
console.log(`\n🏁 Hotovo! OK: ${stats.ok}, Preskočené: ${stats.skip}, Chyby: ${stats.fail}`)
