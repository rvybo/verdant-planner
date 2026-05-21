import { getZahon, getZahony, getZahonPhotos } from '@/lib/zahony'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddToCartButton from './AddToCartButton'
import { CoverHero, CoverCard, PhotoGallery } from './ZahonCover'
import GardenCalculator from './GardenCalculator'

type SectionStyle = { icon: string; bg: string; border: string; text: string; badge: string }

const SECTION_STYLES: Record<string, SectionStyle> = {
  'Stanoviště:':          { icon: '📍', bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',   badge: 'bg-blue-100 text-blue-800' },
  'Stanovisko:':          { icon: '📍', bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',   badge: 'bg-blue-100 text-blue-800' },
  'Termín výsadby:':      { icon: '📅', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800',  badge: 'bg-amber-100 text-amber-800' },
  'Příprava stanoviště:': { icon: '🛠️', bg: 'bg-stone-50',  border: 'border-stone-200',  text: 'text-stone-700',  badge: 'bg-stone-100 text-stone-700' },
  'Výsadba:':             { icon: '🌱', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  badge: 'bg-green-100 text-green-800' },
  'Péče:':                { icon: '✂️', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', badge: 'bg-violet-100 text-violet-800' },
  'Pěstování:':           { icon: '🌿', bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-800',   badge: 'bg-teal-100 text-teal-800' },
  'Rozvoj výsadby:':      { icon: '📈', bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-800',badge: 'bg-emerald-100 text-emerald-800' },
  'Náš tip:':             { icon: '💡', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800' },
  'Charakteristika:':     { icon: '📋', bg: 'bg-stone-50',  border: 'border-stone-200',  text: 'text-stone-700',  badge: 'bg-stone-100 text-stone-700' },
}

const SECTION_HEADERS = Object.keys(SECTION_STYLES)

function DesignText({ text }: { text: string }) {
  const regex = new RegExp(`(${SECTION_HEADERS.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  const parts = text.split(regex).filter(Boolean)

  const nodes: React.ReactNode[] = []
  let i = 0

  if (!SECTION_HEADERS.includes(parts[0])) {
    nodes.push(
      <p key="intro" className="text-sm text-stone-600 leading-relaxed mb-5 pb-5 border-b border-stone-100">
        {parts[0].trim()}
      </p>
    )
    i = 1
  }

  while (i < parts.length) {
    const header = parts[i]
    if (SECTION_HEADERS.includes(header)) {
      const content = (parts[i + 1] || '').trim()
      const s = SECTION_STYLES[header]
      nodes.push(
        <div key={header} className={`rounded-lg border ${s.border} ${s.bg} p-4 mb-3`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base leading-none">{s.icon}</span>
            <span className={`text-xs font-bold uppercase tracking-wide ${s.text}`}>
              {header.replace(':', '')}
            </span>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{content}</p>
        </div>
      )
      i += 2
    } else {
      i++
    }
  }

  return <div>{nodes}</div>
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Máj','Jún','Júl','Aug','Sep','Okt','Nov','Dec']
const MONTH_CZ: Record<string, number> = {
  leden:1, únor:2, březen:3, duben:4, květen:5, červen:6,
  červenec:7, srpen:8, září:9, říjen:10, listopad:11, prosinec:12,
  jaro:3, léto:6, podzim:9, zima:12,
}

function parseBloomMonths(period: string): number[] {
  if (!period?.trim()) return []
  const lower = period.toLowerCase()
  const found: number[] = []
  for (const [name, month] of Object.entries(MONTH_CZ)) {
    if (lower.includes(name)) found.push(month)
  }
  if (found.length === 0) return []
  const min = Math.min(...found)
  const max = Math.max(...found)
  const range: number[] = []
  for (let m = min; m <= max; m++) range.push(m)
  return range
}

function BloomCalendar({ bloomPeriod }: { bloomPeriod: string }) {
  const activeMonths = new Set(parseBloomMonths(bloomPeriod))
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🌸</span>
        <h2 className="text-base font-semibold text-stone-800">Obdobie kvitnutia</h2>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {MONTH_NAMES.map((name, i) => {
          const month = i + 1
          const active = activeMonths.has(month)
          return (
            <div key={month} className="flex flex-col items-center gap-1">
              <div className={`w-full h-6 rounded ${active ? 'bg-green-500' : 'bg-stone-100'}`} />
              <span className={`text-[9px] font-medium ${active ? 'text-green-700' : 'text-stone-400'}`}>
                {name}
              </span>
            </div>
          )
        })}
      </div>
      {bloomPeriod && (
        <p className="text-xs text-stone-400 mt-2 italic">{bloomPeriod}</p>
      )}
    </div>
  )
}

export async function generateStaticParams() {
  return getZahony().map((z) => ({ id: z.id }))
}

export default async function ZahonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const zahon = getZahon(id)
  if (!zahon) notFound()

  const availablePlants = zahon.plants.filter((p) => p.lumigreen.length > 0)
  const photos = getZahonPhotos(id)

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Hero cover image */}
      <CoverHero id={zahon.id} name={zahon.name} />

      <header className="bg-green-800 text-white px-6 py-5">
        <Link href="/" className="text-green-300 text-sm hover:text-white mb-2 inline-block">
          ← Späť na zoznam
        </Link>
        <h1 className="text-2xl font-bold">{zahon.name}</h1>
        <p className="text-green-200 text-sm mt-1">
          {zahon.specs.size} · {zahon.specs.colors}
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Specs */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-stone-400 text-xs mb-1">Svetlo</div>
            <div className="font-medium text-stone-700">{zahon.categories.light}</div>
          </div>
          <div>
            <div className="text-stone-400 text-xs mb-1">Štýl</div>
            <div className="font-medium text-stone-700">{zahon.categories.style}</div>
          </div>
          <div>
            <div className="text-stone-400 text-xs mb-1">Sezóna kvitnutia</div>
            <div className="font-medium text-stone-700">{zahon.specs.bloomPeriod}</div>
          </div>
          <div>
            <div className="text-stone-400 text-xs mb-1">Výška</div>
            <div className="font-medium text-stone-700">{zahon.specs.height}</div>
          </div>
        </div>

        {/* Bloom calendar */}
        <BloomCalendar bloomPeriod={zahon.specs.bloomPeriod} />

        {/* Plan image + PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-4 pt-4 pb-2 text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Fotografia záhona
            </div>
            <CoverCard id={zahon.id} name={zahon.name} />
          </div>
          <div className="flex flex-col justify-center gap-3 p-4 bg-white rounded-xl border border-stone-200">
            <p className="text-sm text-stone-600">
              Stiahnite si kompletný osadzací plán vo formáte PDF vrátane zoznamu rastlín a pokynov na výsadbu.
            </p>
            <a
              href={`https://raw.githubusercontent.com/rvybo/verdant-planner/main/public/zahony/${zahon.id}/plan.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white rounded-lg px-5 py-3 font-medium transition-colors"
            >
              <span>📄</span> Stiahnuť PDF plán
            </a>
          </div>
        </div>

        {/* Lumigreen coverage */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-green-800">Dostupnosť na Lumigreen.sk</span>
            <span className="text-green-700 font-bold text-lg">{zahon.lumigreen.coverage}%</span>
          </div>
          <div className="w-full bg-green-100 rounded-full h-2 mb-3">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${zahon.lumigreen.coverage}%` }}
            />
          </div>
          <p className="text-green-700">
            {zahon.lumigreen.matched} z {zahon.lumigreen.total} druhov nájdených · {availablePlants.length} dostupných na objednanie
          </p>
        </div>

        {/* Plants list */}
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Rastliny záhona</h2>
          <div className="space-y-3">
            {zahon.plants.map((plant, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-stone-200 p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-800 text-sm">{plant.czName}</span>
                    <span className="text-xs text-stone-400 italic">{plant.latin}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">Počet: {plant.qty} ks</div>
                  {plant.lumigreen.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {plant.lumigreen.slice(0, 2).map((p, j) => (
                        <a
                          key={j}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:text-green-800 hover:underline border border-green-200 rounded px-2 py-0.5 bg-green-50"
                        >
                          {p.name.slice(0, 35)}…
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {plant.lumigreen.length > 0 ? (
                    <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1">✓ Dostupné</span>
                  ) : (
                    <span className="text-xs bg-stone-100 text-stone-400 rounded-full px-2 py-1">Nedostupné</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Garden calculator */}
        <GardenCalculator plants={zahon.plants} standardSize={zahon.specs.size} />

        {/* Add to cart */}
        {availablePlants.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h3 className="font-semibold text-stone-800 mb-1">Pridať dostupné rastliny do košíka</h3>
            <p className="text-sm text-stone-500 mb-4">
              {availablePlants.length} druhov bude pridaných do košíka na Lumigreen.sk
            </p>
            <AddToCartButton zahonId={zahon.id} zahonName={zahon.name} />
          </div>
        )}

        {/* Photo gallery */}
        <PhotoGallery id={zahon.id} photos={photos} />

        {/* Description */}
        {zahon.design?.characteristika && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="text-base font-semibold text-stone-800 mb-4">O záhone</h2>
            <DesignText text={zahon.design.characteristika} />
          </div>
        )}
      </div>
    </main>
  )
}
