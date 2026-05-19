// Quick probe: login + check ONE zahon page structure
import { chromium } from 'playwright'

const EMAIL = process.env.Z_EMAIL
const PASS  = process.env.Z_PASS
const BASE  = 'https://zijtevesvezahrade.cz'

const CHROMIUM_PATH = 'C:\\Users\\rvybostok\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe'
const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH })
const page    = await browser.newPage()

// Login (WordPress: field name="log" + name="pwd")
await page.goto(`${BASE}/prihlaseni`, { waitUntil: 'domcontentloaded' })
await page.fill('#user_log', EMAIL)
await page.fill('#user_pass', PASS)
await page.click('#wp-submit')
await page.waitForLoadState('networkidle')
console.log('After login URL:', page.url())

// Visit first zahon
await page.goto(`${BASE}/trvalky/koberec-do-polostinu`, { waitUntil: 'networkidle' })
console.log('Zahon URL:', page.url())

// Find all images
const imgs = await page.$$eval('img', els => els.map(e => e.src).filter(s => s && !s.includes('data:')))
console.log('IMAGES:', imgs.slice(0, 10))

// Find all links (PDF candidates)
const links = await page.$$eval('a', els => els.map(e => ({ href: e.href, text: e.textContent?.trim() }))
  .filter(l => l.href && (l.href.includes('.pdf') || l.text?.toLowerCase().includes('pdf') || l.text?.toLowerCase().includes('stáhnout') || l.text?.toLowerCase().includes('plán') || l.text?.toLowerCase().includes('plan') || l.text?.toLowerCase().includes('stáhnou')))
)
console.log('PDF LINKS:', JSON.stringify(links, null, 2))

// Dump full page title + h1 + meta
const title = await page.title()
const h1 = await page.$eval('h1', e => e.textContent).catch(() => 'no h1')
console.log('TITLE:', title)
console.log('H1:', h1)

// Get all <a> with href containing pdf or download
const allLinks = await page.$$eval('a[href*="pdf"], a[href*="download"], a[href*="plan"], a[href*="osazovaci"], a[href*="osazovací"]', els => els.map(e => ({ href: e.href, text: e.textContent?.trim() })))
console.log('DOWNLOAD LINKS:', JSON.stringify(allLinks, null, 2))

await browser.close()
