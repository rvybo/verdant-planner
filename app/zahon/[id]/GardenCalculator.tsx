'use client'

import { useState, useMemo } from 'react'

interface Plant {
  czName: string
  latin: string
  qty: number
}

interface Props {
  plants: Plant[]
  standardSize: string
}

function parseStandardArea(size: string): number {
  const m = size.match(/(\d+[,.]?\d*)\s*[x×]\s*(\d+[,.]?\d*)/i)
  if (!m) return 6 // default 2x3
  const w = parseFloat(m[1].replace(',', '.'))
  const h = parseFloat(m[2].replace(',', '.'))
  return w * h
}

export default function GardenCalculator({ plants, standardSize }: Props) {
  const standardArea = parseStandardArea(standardSize)
  const canCalculate = standardArea > 0 && !standardSize.toLowerCase().includes('nerozhoduje')

  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')

  const result = useMemo(() => {
    const w = parseFloat(width.replace(',', '.'))
    const h = parseFloat(height.replace(',', '.'))
    if (!w || !h || w <= 0 || h <= 0) return null
    const userArea = w * h
    const scale = userArea / standardArea
    const totalStd = plants.reduce((s, p) => s + p.qty, 0)
    const totalAdj = Math.ceil(totalStd * scale)
    return {
      userArea: userArea.toFixed(1),
      scale: scale.toFixed(2),
      totalStd,
      totalAdj,
      plants: plants.map(p => ({ ...p, adjQty: Math.ceil(p.qty * scale) })),
    }
  }, [width, height, plants, standardArea])

  if (!canCalculate) return null

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">📐</span>
        <h2 className="text-base font-semibold text-stone-800">Kalkulačka záhona</h2>
      </div>
      <p className="text-xs text-stone-400 mb-4">
        Štandardný záhon: <strong className="text-stone-600">{standardSize}</strong> ({standardArea} m²).
        Zadaj rozmery svojho záhona.
      </p>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <label className="text-xs text-stone-500 mb-1 block">Šírka (m)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={width}
            onChange={e => setWidth(e.target.value)}
            placeholder="napr. 3"
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-green-500"
          />
        </div>
        <span className="text-stone-400 mt-5">×</span>
        <div className="flex-1">
          <label className="text-xs text-stone-500 mb-1 block">Dĺžka (m)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder="napr. 4"
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-green-500"
          />
        </div>
        {result && (
          <div className="mt-5 text-right">
            <div className="text-xs text-stone-400">Plocha</div>
            <div className="font-bold text-green-700">{result.userArea} m²</div>
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-xs text-green-600 mb-1">Pôvodný počet</div>
              <div className="text-2xl font-bold text-green-800">{result.totalStd}</div>
              <div className="text-xs text-green-500">rastlín</div>
            </div>
            <div className="flex items-center text-stone-400 text-xl">→</div>
            <div className="flex-1 bg-emerald-600 rounded-lg p-3 text-center">
              <div className="text-xs text-emerald-100 mb-1">Tvoj záhon</div>
              <div className="text-2xl font-bold text-white">{result.totalAdj}</div>
              <div className="text-xs text-emerald-200">rastlín</div>
            </div>
          </div>

          <div className="border border-stone-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-3 py-2 text-stone-500 font-medium">Rastlina</th>
                  <th className="text-right px-3 py-2 text-stone-500 font-medium">Pôv.</th>
                  <th className="text-right px-3 py-2 text-stone-500 font-medium">Upravené</th>
                </tr>
              </thead>
              <tbody>
                {result.plants.map((p, i) => (
                  <tr key={i} className="border-b border-stone-50 last:border-0">
                    <td className="px-3 py-2">
                      <div className="font-medium text-stone-700">{p.czName}</div>
                      <div className="text-stone-400 italic">{p.latin}</div>
                    </td>
                    <td className="px-3 py-2 text-right text-stone-400">{p.qty} ks</td>
                    <td className="px-3 py-2 text-right font-semibold text-green-700">{p.adjQty} ks</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-400 mt-2">Koeficient: ×{result.scale} · počty sú zaokrúhlené nahor</p>
        </>
      )}
    </div>
  )
}
