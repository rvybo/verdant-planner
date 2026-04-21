import { NextRequest, NextResponse } from 'next/server'
import { getZahon } from '@/lib/zahony'
import { chromium } from 'playwright'

const LOGIN_URL = 'https://www.lumigreen.sk/eshop/action/enterlogin.xhtml'
const CART_URL = 'https://www.lumigreen.sk/eshop/action/cart.xhtml'

function extractProductId(url: string): string | null {
  const match = url.match(/\/p-(\d+)\.xhtml/)
  return match ? match[1] : null
}

export async function POST(req: NextRequest) {
  const email = process.env.LUMIGREEN_EMAIL
  const password = process.env.LUMIGREEN_PASSWORD

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Chýbajú prihlasovacie údaje (LUMIGREEN_EMAIL, LUMIGREEN_PASSWORD).' },
      { status: 500 }
    )
  }

  let body: { zahonId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neplatný JSON.' }, { status: 400 })
  }

  if (!body.zahonId) {
    return NextResponse.json({ error: 'Chýba zahonId.' }, { status: 400 })
  }

  const zahon = getZahon(body.zahonId)
  if (!zahon) {
    return NextResponse.json({ error: 'Záhon nenájdený.' }, { status: 404 })
  }

  const availablePlants = zahon.plants.filter((p) => p.lumigreen.length > 0)
  if (availablePlants.length === 0) {
    return NextResponse.json({ error: 'Žiadne dostupné rastliny na Lumigreen.sk.' }, { status: 400 })
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Login
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' })
    await page.fill('input[name="loginUsername"]', email)
    await page.fill('input[name="loginPassword"]', password)
    await page.click('button[type="submit"], input[type="submit"]')
    await page.waitForURL((url) => !url.toString().includes('enterlogin'), { timeout: 10000 })

    const added: string[] = []
    const failed: string[] = []

    for (const plant of availablePlants) {
      const product = plant.lumigreen[0]
      const productId = extractProductId(product.url)
      if (!productId) {
        failed.push(plant.czName)
        continue
      }

      try {
        await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 15000 })
        const form = page.locator(`form[action*="/p-${productId}/order/${productId}"]`)
        const formCount = await form.count()
        if (formCount === 0) {
          failed.push(plant.czName)
          continue
        }
        const qtyInput = form.locator('input[name="count"]')
        const hasQty = await qtyInput.count()
        if (hasQty > 0) {
          await qtyInput.fill(String(plant.qty))
          await qtyInput.dispatchEvent('change')
        }
        await form.evaluate((f) => (f as HTMLFormElement).requestSubmit(f.querySelector('[name="add-button"]') as HTMLElement ?? undefined))
        await page.waitForTimeout(800)
        added.push(`${plant.czName} (${plant.qty} ks)`)
      } catch {
        failed.push(plant.czName)
      }
    }

    await browser.close()

    return NextResponse.json({
      message: `Pridané: ${added.length} druhov. ${failed.length > 0 ? `Nepodarilo sa: ${failed.join(', ')}` : ''}`,
      added,
      failed,
      cartUrl: CART_URL,
    })
  } catch (err) {
    await browser.close()
    const message = err instanceof Error ? err.message : 'Neznáma chyba'
    return NextResponse.json({ error: `Playwright chyba: ${message}` }, { status: 500 })
  }
}
