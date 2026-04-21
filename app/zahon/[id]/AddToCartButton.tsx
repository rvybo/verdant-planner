'use client'

import { useState } from 'react'

interface Props {
  zahonId: string
  zahonName: string
}

export default function AddToCartButton({ zahonId, zahonName }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleClick() {
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zahonId }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? 'Pridané do košíka!')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Chyba pri pridávaní do košíka.')
      }
    } catch {
      setStatus('error')
      setMessage('Chyba siete. Skúste znova.')
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="bg-green-700 hover:bg-green-800 disabled:bg-stone-300 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
      >
        {status === 'loading' ? '⏳ Pridávam do košíka…' : `🛒 Pridať ${zahonName} do košíka`}
      </button>

      {status === 'success' && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          ✅ {message}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          ❌ {message}
        </div>
      )}
    </div>
  )
}
