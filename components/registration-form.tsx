'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'

interface RegistrationFormProps {
  slamId: string
  slamName: string
  organizerName: string
}

export default function RegistrationForm({ slamId, slamName, organizerName }: RegistrationFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' })
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/slams/${slamId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Błąd serwera')

      const params = new URLSearchParams({
        status: data.status,
        position: String(data.position),
        name: form.name,
        contact_mode: data.contact_mode ?? 'auto',
      })
      router.push(`/slam/${slamId}/registered?${params}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Błąd serwera')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Imię, nazwisko lub pseudonim sceniczny"
        placeholder="np. Anna Kowalska lub Wierszokleta"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        autoComplete="name"
      />
      <Input
        label="Email (dostaniesz potwierdzenie na skrzynkę)"
        type="email"
        placeholder="anna@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        autoComplete="email"
      />
      <Input
        label="Telefon (opcjonalnie)"
        type="tel"
        placeholder="+48 000 000 000"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        autoComplete="tel"
      />
      <Textarea
        label="Uwagi (opcjonalnie)"
        placeholder="Czy masz jakieś szczególne potrzeby lub chcesz coś nam powiedzieć?"
        rows={1}
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 w-4 h-4 shrink-0 accent-[#c0392b]"
          required
        />
        <span className="text-xs text-[#666] group-hover:text-[#888] transition-colors leading-relaxed">
          Wyrażam zgodę na przetwarzanie moich danych osobowych (imię, email, telefon) przez <strong>{organizerName}</strong> w celu organizacji tego wydarzenia. Dane są obsługiwane przez platformę SlamSlot i zostaną usunięte po 90 dniach od daty slamu.{' '}
          <a href="/polityka-prywatnosci" target="_blank" className="text-[#c0392b] hover:underline">
            Polityka prywatności
          </a>
        </span>
      </label>
      <Button type="submit" size="lg" loading={loading} className="w-full" disabled={!consent}>
        Zapisz się na {slamName}
      </Button>
    </form>
  )
}
