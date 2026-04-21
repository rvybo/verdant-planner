import fs from 'fs'
import path from 'path'

export interface Plant {
  czName: string
  qty: number
  latin: string
  lumigreen: { name: string; url: string }[]
}

export interface Zahon {
  id: string
  name: string
  categories: {
    light: string
    style: string
    moisture: string
    season: string
  }
  specs: {
    size: string
    height: string
    bloomPeriod: string
    colors: string
  }
  design: {
    characteristika: string
    location: string
    suitableFor: string
  }
  care?: Record<string, string>
  plants: Plant[]
  lumigreen: {
    coverage: number
    matched: number
    total: number
  }
}

let _cache: Zahon[] | null = null

export function getZahony(): Zahon[] {
  if (_cache) return _cache
  const filePath = path.join(process.cwd(), 'data', 'zahon-library.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  _cache = JSON.parse(raw) as Zahon[]
  return _cache
}

export function getZahon(id: string): Zahon | undefined {
  return getZahony().find((z) => z.id === id)
}
