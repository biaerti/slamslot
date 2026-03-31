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
  const [organizerName, setOrganizerName] = useState(slam.organizer_name ?? '')
  const [description, setDescription] = useState(slam.description ?? '')
  const [location, setLocation] = useState(slam.location ?? '')
  const [fbEventUrl, setFbEventUrl] = useState(slam.fb_event_url ?? '')
  const [showSpots, setShowSpots] = useState(slam.show_spots ?? true)
  const [eventDate, setEventDate] = useState(
    slam.event_date ? slam.event_date.replace(' ', 'T').slice(0, 16) : ''
  )
  const [maxParticipants, setMaxParticipants] = useState(String(slam.max_participants))
  const [imageUrl, setImageUrl] = useState(slam.image_url ?? '')
  const [imageUploading, setImageUploading] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Błąd uploadu')
      setImageUrl(data.url)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Błąd uploadu')
    } finally {
      setImageUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/${organizerToken}/edit-slam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          organizer_name: organizerName,
          description,
          location,
          fb_event_url: fbEventUrl,
          show_spots: showSpots,
          event_date: eventDate ? eventDate.replace('T', ' ') : undefined,
          max_participants: maxParticipants,
          image_url: imageUrl || null,
        }),
      })
      if (!res.ok) throw new Error()
      onSaved({ name, organizer_name: organizerName || slam.organizer_name, description: description || null, location: location || null, fb_event_url: fbEventUrl || null, show_spots: showSpots, event_date: eventDate.replace('T', ' '), max_participants: Number(maxParticipants), image_url: imageUrl || null })
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
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Nazwa organizatora</label>
            <input
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
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
              <label className="flex items-center gap-1.5 cursor-pointer group mt-1.5">
                <input
                  type="checkbox"
                  checked={showSpots}
                  onChange={(e) => setShowSpots(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#c0392b]"
                />
                <span className="text-xs text-[#555] group-hover:text-[#888] transition-colors whitespace-nowrap">
                  Pokaż wolne
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Link do FB (opcjonalnie)</label>
            <input
              value={fbEventUrl}
              onChange={(e) => setFbEventUrl(e.target.value)}
              placeholder="https://facebook.com/events/..."
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#3a3a3a]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">Lokalizacja (opcjonalnie)</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Miasto / Lokal"
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
          <div>
            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1">
              Zdjęcie / logo (opcjonalnie)
            </label>
            <div className="flex gap-3 items-start">
              <label className="flex-1 cursor-pointer">
                <div className="border border-dashed border-[#2a2a2a] hover:border-[#555] px-3 py-2 text-xs text-[#555] hover:text-[#888] transition-colors">
                  {imageUploading ? 'Wysyłanie...' : imageUrl ? 'Zmień zdjęcie' : 'Wybierz plik (JPG, PNG, WebP, max 5 MB)'}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={imageUploading}
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs text-[#555] hover:text-[#c0392b] transition-colors shrink-0 pt-2"
                >
                  Usuń
                </button>
              )}
            </div>
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
