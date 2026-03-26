'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Slam } from '@/types'

interface EditSlamModalProps {
  slam: Slam
  organizerToken: string
  onSaved: (updated: Partial<Slam>) => void
  onClose: () => void
}

export default function EditSlamModal({ slam, organizerToken, onSaved, onClose }: EditSlamModalProps) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(slam.name)
  const [description, setDescription] = useState(slam.description ?? '')
  const [location, setLocation] = useState(slam.location ?? '')
  const [eventDate, setEventDate] = useState(
    slam.event_date ? slam.event_date.replace(' ', 'T').slice(0, 16) : ''
  )
  const [maxParticipants, setMaxParticipants] = useState(String(slam.max_participants))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/${organizerToken}/edit-slam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          location,
          event_date: eventDate ? eventDate.replace('T', ' ') : undefined,
          max_participants: maxParticipants,
        }),
      })
      if (!res.ok) throw new Error()
      onSaved({ name, description: description || null, location: location || null, event_date: eventDate.replace('T', ' '), max_participants: Number(maxParticipants) })
      toast.success('Dane slamu zaktualizowane')
      onClose()
    } catch {
      toast.error('Błąd zapisu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-[#111] border border-[#2a2a2a] w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Edytuj dane slamu</p>
          <button onClick={onClose} className="text-[#555] hover:text-[#aaa] transition-colors text-lg leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Nazwa slamu</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Data i godzina</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Miejsc</label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Lokalizacja (opcjonalnie)</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="np. link Google Maps lub nazwa miejsca"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#3a3a3a]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Opis (opcjonalnie)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={save}
            disabled={saving}
            className="text-xs text-white bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 px-4 py-2 transition-colors"
          >
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
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
