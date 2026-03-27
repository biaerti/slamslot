'use client'

import { useState } from 'react'
import { Input, Textarea } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'

export default function CreateSlamForm() {
  const [form, setForm] = useState({
    organizer_name: '',
    name: '',
    description: '',
    fb_event_url: '',
    event_date: '',
    max_participants: 20,
    location: '',
    organizer_email: '',
    image_url: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    public_url: string
    dashboard_url: string
    organizer_token: string
  } | null>(null)
  const [password, setPassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [copied, setCopied] = useState<'public' | 'dashboard' | null>(null)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Błąd uploadu')
      setForm((f) => ({ ...f, image_url: data.url }))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Błąd uploadu zdjęcia')
      setImageFile(null)
      setImagePreview(null)
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/slams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Błąd')
      setResult(data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Błąd serwera')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async () => {
    if (!result || !password) return
    setPasswordLoading(true)
    try {
      const res = await fetch(`/api/dashboard/${result.organizer_token}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error('Błąd')
      setPasswordSaved(true)
      toast.success('Hasło ustawione!')
    } catch {
      toast.error('Nie udało się ustawić hasła')
    } finally {
      setPasswordLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'public' | 'dashboard') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success('Skopiowano do schowka!')
    setTimeout(() => setCopied(null), 2000)
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-[#c0392b] pl-4">
          <p className="font-display text-3xl text-white">Slam stworzony!</p>
          <p className="text-[#aaa] mt-1 text-sm">Zapisz oba linki w bezpiecznym miejscu.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#141414] border border-[#2a2a2a] p-4">
            <p className="text-xs font-bold text-[#aaa] uppercase tracking-wider mb-2">
              Link dla uczestników (wrzuć na FB)
            </p>
            <p className="text-[#f0f0f0] font-mono text-sm break-all">{result.public_url}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => copyToClipboard(result.public_url, 'public')}
            >
              {copied === 'public' ? 'Skopiowano!' : 'Kopiuj link'}
            </Button>
          </div>

          <div className="bg-[#141414] border border-[#c0392b]/40 p-4">
            <p className="text-xs font-bold text-[#c0392b] uppercase tracking-wider mb-2">
              Link do dashboardu (tylko dla Ciebie!)
            </p>
            <p className="text-[#f0f0f0] font-mono text-sm break-all">{result.dashboard_url}</p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => copyToClipboard(result.dashboard_url, 'dashboard')}
              >
                {copied === 'dashboard' ? 'Skopiowano!' : 'Kopiuj link'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(result.dashboard_url, '_blank')}
              >
                Otwórz dashboard
              </Button>
            </div>
          </div>
        </div>

          <div className="bg-[#141414] border border-[#2a2a2a] p-4">
            <p className="text-xs font-bold text-[#aaa] uppercase tracking-wider mb-1">
              Hasło do dashboardu (opcjonalnie)
            </p>
            <p className="text-[#555] text-xs mb-3">
              Ustaw hasło jeśli chcesz zabezpieczyć dostęp do dashboardu.
            </p>
            {passwordSaved ? (
              <p className="text-green-500 text-sm font-semibold">✓ Hasło ustawione</p>
            ) : (
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Min. 4 znaki"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] placeholder-[#555] px-3 py-2 text-sm focus:outline-none focus:border-[#c0392b] transition-colors"
                  autoComplete="new-password"
                />
                <button
                  onClick={handleSetPassword}
                  disabled={passwordLoading || password.length < 4}
                  className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-sm font-bold transition-colors disabled:opacity-40"
                >
                  {passwordLoading ? '...' : 'Ustaw'}
                </button>
              </div>
            )}
          </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setResult(null)}
        >
          Stwórz kolejny slam
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        label="Nazwa organizatora / kolektywu"
        placeholder="np. SlamSlot"
        value={form.organizer_name}
        onChange={(e) => setForm({ ...form, organizer_name: e.target.value })}
        required
      />
      <Input
        label="Nazwa slamu"
        placeholder="np. Slam w Pubie Slot #15"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <Textarea
        label="Opis (opcjonalnie)"
        placeholder="Opis wydarzenia — pojawi się na stronie zapisu dla uczestników..."
        rows={1}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        label="Link do wydarzenia na Facebooku (opcjonalnie)"
        type="url"
        placeholder="https://facebook.com/events/..."
        value={form.fb_event_url}
        onChange={(e) => setForm({ ...form, fb_event_url: e.target.value })}
      />
      <div className="grid grid-cols-[1fr_13rem] gap-4">
        <Input
          label="Data i godzina"
          type="datetime-local"
          value={form.event_date}
          min="2020-01-01T00:00"
          max="2099-12-31T23:59"
          onChange={(e) => setForm({ ...form, event_date: e.target.value })}
          required
        />
        <Input
          label="Liczba miejsc"
          type="number"
          min={1}
          max={500}
          value={form.max_participants}
          onChange={(e) =>
            setForm({ ...form, max_participants: parseInt(e.target.value) || 20 })
          }
          required
        />
        <Input
          label="Twój email"
          type="email"
          placeholder="organizator@example.com"
          value={form.organizer_email}
          onChange={(e) => setForm({ ...form, organizer_email: e.target.value })}
          autoComplete="email"
        />
        <Input
          label="Lokalizacja (opcjonalnie)"
          placeholder="lokal / link GoogleMaps"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <div className="w-full">
        <div className="flex items-baseline gap-2 mb-1.5">
          <label className="block text-xs font-semibold text-[#aaa] uppercase tracking-wider">
            Zdjęcie / logo wydarzenia (opcjonalnie)
          </label>
          <span className="text-xs text-[#555]">sugerowany format 1:1</span>
        </div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="flex-1 border border-dashed border-[#2a2a2a] group-hover:border-[#555] px-4 py-3 transition-colors text-sm text-[#555] group-hover:text-[#888]">
            {imageUploading
              ? 'Wysyłanie...'
              : imageFile
              ? imageFile.name
              : 'Kliknij, żeby wybrać plik (JPG, PNG, WebP, max 5 MB)'}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
            disabled={imageUploading}
          />
        </label>
        {imagePreview && !imageUploading && (
          <div className="mt-2 relative w-full h-24 overflow-hidden border border-[#2a2a2a]">
            <img src={imagePreview} alt="Podgląd" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null); setForm((f) => ({ ...f, image_url: '' })) }}
              className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 hover:bg-black"
            >
              Usuń
            </button>
          </div>
        )}
      </div>
      <Button type="submit" size="lg" loading={loading} disabled={imageUploading} className="w-full">
        Stwórz slam i wygeneruj link
      </Button>
    </form>
  )
}
