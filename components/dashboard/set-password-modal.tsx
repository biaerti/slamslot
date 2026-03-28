'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface SetPasswordModalProps {
  organizerToken: string
  hasPassword: boolean
  onSaved: () => void
  onRemoved: () => void
  onClose: () => void
}

export default function SetPasswordModal({ organizerToken, hasPassword, onSaved, onRemoved, onClose }: SetPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleSave = async () => {
    if (password.length < 4) {
      toast.error('Hasło musi mieć min. 4 znaki')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/${organizerToken}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error()
      toast.success(hasPassword ? 'Hasło zmienione' : 'Hasło ustawione')
      onSaved()
      onClose()
    } catch {
      toast.error('Błąd zapisu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-[#111] border border-[#2a2a2a] w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold text-[#888] uppercase tracking-widest">
            {hasPassword ? 'Zmień hasło do dashboardu' : 'Ustaw hasło do dashboardu'}
          </p>
          <button onClick={onClose} className="text-[#555] hover:text-[#aaa] text-lg leading-none">×</button>
        </div>

        <p className="text-xs text-[#444] mb-4">
          Hasło chroni dashboard przed osobami, które mają link. Min. 4 znaki.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Nowe hasło"
          autoFocus
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#3a3a3a] mb-4"
        />

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs text-white bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 px-4 py-2 transition-colors font-bold"
          >
            {saving ? 'Zapisywanie...' : hasPassword ? 'Zmień hasło' : 'Ustaw hasło'}
          </button>
          {hasPassword && (
            <button
              onClick={async () => {
                setRemoving(true)
                try {
                  const res = await fetch(`/api/dashboard/${organizerToken}/remove-password`, { method: 'POST' })
                  if (!res.ok) throw new Error()
                  toast.success('Hasło usunięte')
                  onRemoved()
                  onClose()
                } catch {
                  toast.error('Błąd usuwania hasła')
                } finally {
                  setRemoving(false)
                }
              }}
              disabled={removing}
              className="text-xs text-[#555] hover:text-red-400 border border-[#2a2a2a] hover:border-red-400/40 disabled:opacity-50 px-4 py-2 transition-colors"
            >
              {removing ? 'Usuwanie...' : 'Usuń hasło'}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-4 py-2 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  )
}
