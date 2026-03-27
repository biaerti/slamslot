'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage({ params }: { params: { reset_token: string } }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/dashboard/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_token: params.reset_token, new_password: password }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      router.push(`/dashboard/${data.organizer_token}`)
    } else {
      setError(data.error ?? 'Błąd. Spróbuj ponownie.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
      <div className="w-full max-w-sm border border-[#2a2a2a] bg-[#0d0d0d] p-8">
        <p className="font-display text-2xl text-white tracking-widest mb-1">SLAMSLOT</p>
        <p className="text-xs text-[#c0392b] uppercase tracking-widest font-bold mb-6">Ustaw nowe hasło</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#aaa] uppercase tracking-wider mb-1.5">
              Nowe hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={4}
              required
              autoFocus
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] px-4 py-3 focus:outline-none focus:border-[#c0392b] transition-colors"
            />
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || password.length < 4}
            className="w-full bg-[#c0392b] hover:bg-[#a93226] text-white font-bold py-3 transition-colors disabled:opacity-50"
          >
            {loading ? 'Zapisuję...' : 'Ustaw hasło i wejdź do dashboardu'}
          </button>
        </form>
      </div>
    </div>
  )
}
