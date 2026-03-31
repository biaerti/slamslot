'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface AddParticipantModalProps {
  organizerToken: string
  onAdded: () => void
  onClose: () => void
}

export default function AddParticipantModal({ organizerToken, onAdded, onClose }: AddParticipantModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/${organizerToken}/add-participant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Błąd serwera')
      toast.success(
        data.status === 'confirmed'
          ? `Dodano na listę główną (#${data.position})`
          : `Dodano na listę rezerwową (#${data.position})`
      )
      onAdded()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Błąd serwera')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#141414] border border-[#2a2a2a] p-6 w-full max-w-sm">
        <p className="font-bold text-white text-base mb-1">Dodaj uczestnika ręcznie</p>
        <p className="text-[#555] text-xs mb-5">Żaden email nie zostanie wysłany.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-[#666] mb-1">Imię / pseudonim *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1">Uwagi / źródło</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="np. zapisał się mailem, FB, znajomy"
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#333]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 text-white text-sm font-bold py-2 transition-colors"
            >
              {loading ? 'Dodawanie...' : 'Dodaj'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#2a2a2a] text-[#888] hover:text-white text-sm py-2 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
