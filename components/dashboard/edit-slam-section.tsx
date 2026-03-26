'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Slam } from '@/types'

interface EditSlamSectionProps {
  slam: Slam
  organizerToken: string
  onSaved: (updated: Partial<Slam>) => void
}

export default function EditSlamSection({ slam, organizerToken, onSaved }: EditSlamSectionProps) {
  const [open, setOpen] = useState(false)
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
      setOpen(false)
    } catch {
      toast.error('Błąd zapisu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-b border-[#2a2a2a] bg-[#0d0d0d]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-[#111] transition-colors"
      >
        <span className="text-xs font-bold text-[#888] uppercase tracking-widest">
          Edytuj dane slamu
        </span>
        <span className="text-[#888] text-sm">{open ? '↑' : '↓'}</span>
      </button>

      {open && (
        <div className="px-6 pb-5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Nazwa slamu</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Data i godzina</label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Miejsc</label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Lokalizacja (opcjonalnie)</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="np. link Google Maps lub nazwa miejsca"
                className="w-full bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Opis (opcjonalnie)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444]"
              />
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-3">
            <button
              onClick={save}
              disabled={saving}
              className="text-xs text-white bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 px-3 py-1.5 transition-colors"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
