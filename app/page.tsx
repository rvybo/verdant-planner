import { getZahony } from '@/lib/zahony'
import Link from 'next/link'

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

export default function HomePage() {
  const zahony = getZahony()

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-green-800 text-white px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight">🌿 Verdant Planner</h1>
        <p className="mt-1 text-green-200 text-sm">Knižnica profesionálnych záhonov · {zahony.length} návrhov</p>
      </header>

      <section className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {zahony.map((z) => (
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

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400">{z.plants.length} druhov</span>
                <span className="text-xs text-green-600 font-medium group-hover:underline">
                  Zobraziť →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

