'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ConfirmAttendancePage() {
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading')

  useEffect(() => {
    fetch(`/api/reminder/confirm/${token}`, { method: 'POST' })
      .then((res) => setState(res.ok ? 'done' : 'error'))
      .catch(() => setState('error'))
  }, [token])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
      <div className="max-w-md w-full border border-[#2a2a2a] bg-[#0d0d0d] p-10 text-center">
        <p className="font-display text-3xl text-white tracking-widest mb-2">SLAMSLOT</p>
        <div className="w-8 h-px bg-[#c0392b] mx-auto mb-8" />

        {state === 'loading' && (
          <p className="text-[#888] text-sm">Potwierdzam...</p>
        )}

        {state === 'done' && (
          <>
            <p className="text-green-400 font-bold text-lg mb-3">Dzięki! Do zobaczenia na slamie ✓</p>
            <p className="text-[#888] text-sm">
              Twoje uczestnictwo zostało potwierdzone.
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <p className="text-[#c0392b] font-bold text-lg mb-3">Coś poszło nie tak</p>
            <p className="text-[#888] text-sm">
              Link jest nieważny lub uczestnictwo zostało już wcześniej potwierdzone.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
