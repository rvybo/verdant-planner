'use client'

import { useState } from 'react'

const CDN = 'https://raw.githubusercontent.com/rvybo/verdant-planner/main/public/zahony'

export function CoverHero({ id, name }: { id: string; name: string }) {
  const [src, setSrc] = useState(`${CDN}/${id}/cover.jpg`)
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <div className="relative h-56 sm:h-72 overflow-hidden bg-stone-200">
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => {
          if (src.endsWith('.jpg')) setSrc(`${CDN}/${id}/cover.png`)
          else setFailed(true)
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
    </div>
  )
}

export function PlanImg({ id }: { id: string }) {
  const [src, setSrc] = useState(`${CDN}/${id}/plan-image.jpg`)
  const [failed, setFailed] = useState(false)

  if (failed) return <div className="h-32 bg-stone-100 flex items-center justify-center text-stone-400 text-xs">Plán nedostupný</div>

  return (
    <img
      src={src}
      alt="Osadzací plán"
      className="w-full object-contain max-h-64"
      onError={() => {
        if (src.endsWith('.jpg')) setSrc(`${CDN}/${id}/plan-image.png`)
        else setFailed(true)
      }}
    />
  )
}

export function CoverCard({ id, name }: { id: string; name: string }) {
  const [src, setSrc] = useState(`${CDN}/${id}/cover.jpg`)
  const [failed, setFailed] = useState(false)

  if (failed) return <div className="h-48 bg-stone-100 flex items-center justify-center text-stone-400 text-sm">Foto nedostupné</div>

  return (
    <img
      src={src}
      alt={name}
      className="w-full h-48 object-cover"
      onError={() => {
        if (src.endsWith('.jpg')) setSrc(`${CDN}/${id}/cover.png`)
        else setFailed(true)
      }}
    />
  )
}

function GalleryPhoto({ id, file }: { id: string; file: string }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <a href={`${CDN}/${id}/${file}`} target="_blank" rel="noopener noreferrer">
      <img
        src={`${CDN}/${id}/${file}`}
        alt={file.split('/').pop()?.replace(/-415x280\.(jpg|jpeg|png)$/i, '').replace(/-/g, ' ') ?? ''}
        className="w-full h-36 object-cover rounded-lg hover:opacity-90 transition-opacity"
        onError={() => setVisible(false)}
      />
    </a>
  )
}

export function PhotoGallery({ id, photos }: { id: string; photos: string[] }) {
  if (photos.length === 0) return null
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <h2 className="text-base font-semibold text-stone-800 mb-4">Fotogaléria ({photos.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((file) => (
          <GalleryPhoto key={file} id={id} file={file} />
        ))}
      </div>
    </div>
  )
}
