'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Zahon } from '@/lib/zahony'

function CoverImage({ id, alt }: { id: string; alt: string }) {
  const [src, setSrc] = useState(`/zahony/${id}/cover.jpg`)
  const [failed, setFailed] = useState(false)
  if (failed) return <div className="h-40 bg-stone-100" />
  return (
    <div className="h-40 bg-stone-100 overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => {
          if (src.endsWith('.jpg')) setSrc(`/zahony/${id}/cover.png`)
          else setFailed(true)
        }}
      />
    </div>
  )
}

const LIGHT_LABELS: Record<string, string> = {
  slnko: '☀️ Slnko',
  polotien: '⛅ Polotieň',
  tien: '🌑 Tieň',
}

const STYLE_LABELS: Record<string, string> = {
  'prírodný': '🌿 Prírodný',
  formálny: '🏛️ Formálny',
  'zmiešaný': '🌸 Zmiešaný',
  romantický: '💐 Romantický',
}

const LIGHT_OPTIONS = [
  { value: '', label: 'Všetko svetlo' },
  { value: 'slnko', label: '☀️ Slnko' },
  { value: 'polotien', label: '⛅ Polotieň' },
  { value: 'tien', label: '🌑 Tieň' },
]

export default function ZahonyGrid({ zahony }: { zahony: Zahon[] }) {
  const [search, setSearch] = useState('')
  const [light, setLight] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return zahony.filter((z) => {
      // light filter
      if (light && z.categories.light !== light) return false

      // search filter — hľadá v názve záhona, rastlinách (czName, latin)
      if (q) {
        const inName = z.name.toLowerCase().includes(q)
        const inPlants = z.plants.some(
          (p) =>
            p.czName.toLowerCase().includes(q) ||
            p.latin.toLowerCase().includes(q)
        )
        if (!inName && !inPlants) return false
      }

      return true
    })
  }, [zahony, search, light])

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Hľadaj rastlinu alebo záhon… (napr. Heuchera, Astilba)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
        />
        <div className="flex gap-2">
          {LIGHT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLight(opt.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                light === opt.value
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-green-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-stone-400 mb-4">
        {filtered.length === zahony.length
          ? `${zahony.length} záhonov`
          : `${filtered.length} z ${zahony.length} záhonov`}
        {search && (
          <span className="ml-1">
            pre <span className="text-stone-600 font-medium">"{search}"</span>
          </span>
        )}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <div className="text-4xl mb-3">🌿</div>
          <div className="text-sm">Žiadne záhony pre tieto filtre</div>
          <button
            onClick={() => { setSearch(''); setLight('') }}
            className="mt-3 text-green-600 text-sm hover:underline"
          >
            Zrušiť filtre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((z) => {
            // Highlight matching plants
            const q = search.trim().toLowerCase()
            const matchingPlants = q
              ? z.plants.filter(
                  (p) =>
                    p.czName.toLowerCase().includes(q) ||
                    p.latin.toLowerCase().includes(q)
                )
              : []

            return (
              <Link
                key={z.id}
                href={`/zahon/${z.id}`}
                className="block bg-white rounded-xl border border-stone-200 hover:border-green-400 hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Cover photo */}
                <CoverImage id={z.id} alt={z.name} />

                <div className="p-4 flex flex-col gap-3">
                  {/* Názov */}
                  <h2 className="font-semibold text-stone-800 group-hover:text-green-700 leading-snug text-sm">
                    {z.name}
                  </h2>

                  {/* Tagy — svetlo + štýl */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
                      {LIGHT_LABELS[z.categories.light] ?? z.categories.light}
                    </span>
                    <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 font-medium">
                      {STYLE_LABELS[z.categories.style] ?? z.categories.style}
                    </span>
                  </div>

                  {/* Parametre */}
                  <div className="text-xs text-stone-500 space-y-1">
                    <div>📐 <span className="text-stone-700 font-medium">{z.specs.size}</span></div>
                    <div>🌸 <span className="text-stone-700 font-medium">{z.specs.bloomPeriod}</span></div>
                    <div>🎨 <span className="text-stone-700 font-medium">{z.specs.colors}</span></div>
                  </div>

                  {/* Matching plants highlight */}
                  {matchingPlants.length > 0 && (
                    <div className="pt-2 border-t border-stone-100">
                      <div className="text-xs text-green-700 font-medium mb-1">🔍 Obsahuje:</div>
                      <div className="flex flex-wrap gap-1">
                        {matchingPlants.slice(0, 3).map((p, i) => (
                          <span
                            key={i}
                            className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5"
                          >
                            {p.czName}
                          </span>
                        ))}
                        {matchingPlants.length > 3 && (
                          <span className="text-xs text-stone-400">+{matchingPlants.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Päta */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-semibold">
                        🛒 {z.lumigreen.coverage}%
                      </span>
                      <span className="text-xs text-stone-400">{z.plants.length} druhov</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium group-hover:underline">
                      Detail →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
