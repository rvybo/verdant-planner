'use client'

import { useState, useEffect, useCallback } from 'react'

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

function GalleryThumb({ id, file, onClick }: { id: string; file: string; onClick: () => void }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <button className="block w-full cursor-zoom-in" onClick={onClick}>
      <img
        src={`${CDN}/${id}/${file}`}
        alt=""
        className="w-full h-36 object-cover rounded-lg hover:opacity-90 transition-opacity"
        onError={() => setVisible(false)}
      />
    </button>
  )
}

export function PhotoGallery({ id, photos }: { id: string; photos: string[] }) {
  const [active, setActive] = useState<number | null>(null)

  const close = useCallback(() => setActive(null), [])
  const prev = useCallback(() => setActive(i => i !== null ? (i - 1 + photos.length) % photos.length : null), [photos.length])
  const next = useCallback(() => setActive(i => i !== null ? (i + 1) % photos.length : null), [photos.length])

  useEffect(() => {
    if (active === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, close, prev, next])

  if (photos.length === 0) return null

  return (
    <>
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="text-base font-semibold text-stone-800 mb-4">Fotogaléria ({photos.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((file, idx) => (
            <GalleryThumb key={file} id={id} file={file} onClick={() => setActive(idx)} />
          ))}
        </div>
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          {/* Prev */}
          <button
            className="absolute left-3 sm:left-6 text-white bg-black/40 hover:bg-black/70 rounded-full w-11 h-11 flex items-center justify-center text-2xl transition-colors z-10"
            onClick={e => { e.stopPropagation(); prev() }}
            aria-label="Predchádzajúca"
          >‹</button>

          {/* Image */}
          <img
            src={`${CDN}/${id}/${photos[active]}`}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          <button
            className="absolute right-3 sm:right-6 text-white bg-black/40 hover:bg-black/70 rounded-full w-11 h-11 flex items-center justify-center text-2xl transition-colors z-10"
            onClick={e => { e.stopPropagation(); next() }}
            aria-label="Nasledujúca"
          >›</button>

          {/* Counter + close */}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-white/70 text-sm">{active + 1} / {photos.length}</span>
            <button
              className="text-white bg-black/40 hover:bg-black/70 rounded-full w-9 h-9 flex items-center justify-center text-lg transition-colors"
              onClick={close}
              aria-label="Zavrieť"
            >✕</button>
          </div>
        </div>
      )}
    </>
  )
}
