'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function CancelPage() {
  const { cancel_token } = useParams<{ cancel_token: string }>()
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleCancel = async () => {
    setState('loading')
    const res = await fetch(`/api/cancel/${cancel_token}`, { method: 'POST' })
    setState(res.ok ? 'done' : 'error')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
      <div className="max-w-md w-full border border-[#2a2a2a] bg-[#0d0d0d] p-10 text-center">
        <p className="font-display text-3xl text-white tracking-widest mb-2">SLAMSLOT</p>
        <div className="w-8 h-px bg-[#c0392b] mx-auto mb-8" />

        {state === 'done' ? (
          <>
            <p className="text-[#c0392b] font-bold text-lg mb-3">Zapis anulowany</p>
            <p className="text-[#888] text-sm">
              Twoje miejsce zostało zwolnione. Jeśli byłeś/aś na liście głównej,
              pierwsza osoba z rezerwowej dostała powiadomienie.
            </p>
          </>
        ) : state === 'error' ? (
          <>
            <p className="text-[#c0392b] font-bold text-lg mb-3">Coś poszło nie tak</p>
            <p className="text-[#888] text-sm">
              Link jest nieważny lub zapis został już wcześniej anulowany.
            </p>
          </>
        ) : (
          <>
            <p className="text-white font-bold text-lg mb-3">Anulować zapis?</p>
            <p className="text-[#888] text-sm mb-8">
              Twoje miejsce zostanie zwolnione i nie będzie możliwości cofnięcia tej operacji.
            </p>
            <button
              onClick={handleCancel}
              disabled={state === 'loading'}
              className="w-full bg-[#c0392b] hover:bg-[#a93226] text-white font-bold py-3 px-6 transition-colors disabled:opacity-50"
            >
              {state === 'loading' ? 'Anulowanie...' : 'Tak, anuluj mój zapis'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
