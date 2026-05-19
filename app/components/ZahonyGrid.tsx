'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Zahon } from '@/lib/zahony'

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
                className="block bg-white rounded-xl border border-stone-200 hover:border-green-400 hover:shadow-md transition-all p-4 group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-stone-800 group-hover:text-green-700 leading-tight text-sm">
                    {z.name}
                  </h2>
                  <span className="shrink-0 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                    {z.lumigreen.coverage}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-xs text-stone-500">
                    {LIGHT_LABELS[z.categories.light] ?? z.categories.light}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-500">
                    {STYLE_LABELS[z.categories.style] ?? z.categories.style}
                  </span>
                </div>

                <div className="text-xs text-stone-400 space-y-0.5">
                  <div>📐 {z.specs.size}</div>
                  <div>🌈 {z.specs.colors}</div>
                </div>

                {/* Matching plants highlight */}
                {matchingPlants.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <div className="text-xs text-green-700 font-medium mb-1">Obsahuje:</div>
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

                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-400">{z.plants.length} druhov</span>
                  <span className="text-xs text-green-600 font-medium group-hover:underline">
                    Zobraziť →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
