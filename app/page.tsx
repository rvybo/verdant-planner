import { getZahony } from '@/lib/zahony'
import ZahonyGrid from '@/app/components/ZahonyGrid'
import LogoutButton from '@/app/components/LogoutButton'

export default function HomePage() {
  const zahony = getZahony()

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-green-800 text-white px-6 py-8">
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">🌿 Verdant Planner</h1>
            <p className="mt-1 text-green-200 text-sm">Knižnica profesionálnych záhonov · {zahony.length} návrhov</p>
          </div>
          <LogoutButton />
        </div>
      </header>
      <section className="px-6 py-8 max-w-7xl mx-auto">
        <ZahonyGrid zahony={zahony} />
      </section>
    </main>
  )
}

