'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Slam } from '@/types'

interface ReminderModalProps {
  slam: Slam
  organizerToken: string
  formattedDate: string
  confirmedCount: number
  onSaved: (updated: Partial<Slam>) => void
  onClose: () => void
}

function ReminderEmailPreview({
  slamName,
  slamDate,
  reminderMessage,
  organizerMessage,
  organizerEmail,
}: {
  slamName: string
  slamDate: string
  reminderMessage: string
  organizerMessage: string
  organizerEmail?: string
}) {
  const msg = reminderMessage.trim() || organizerMessage.trim() || null

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 3, margin: '0 0 12px', textTransform: 'uppercase' }}>
        {slamName}
      </p>
      <hr style={{ borderColor: '#333', margin: '0 0 12px' }} />
      <p style={{ color: '#c0392b', fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>
        Przypomnienie o slamie ⏰
      </p>
      <p style={{ color: '#e0e0e0', fontSize: 14, lineHeight: '22px', margin: '0 0 6px' }}>
        Cześć <strong>Jan Kowalski</strong>,
      </p>
      <p style={{ color: '#e0e0e0', fontSize: 14, lineHeight: '22px', margin: '0 0 12px' }}>
        Przypominamy, że jutro odbędzie się <strong>{slamName}</strong>! Czekamy na Ciebie.
      </p>
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderLeft: '4px solid #c0392b', padding: '12px 16px', margin: '0 0 12px' }}>
        <p style={{ color: '#e0e0e0', fontSize: 13, margin: '0 0 4px' }}><strong>Wydarzenie:</strong> {slamName}</p>
        <p style={{ color: '#e0e0e0', fontSize: 13, margin: 0 }}><strong>Data:</strong> {slamDate}</p>
      </div>

      {msg ? (
        <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderLeft: '4px solid #c0392b', padding: '10px 14px', margin: '0 0 12px' }}>
          <p style={{ color: '#888', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>Od organizatora:</p>
          <p style={{ color: '#ccc', fontSize: 13, lineHeight: '20px', margin: 0 }}>{msg}</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#111', border: '1px dashed #2a2a2a', padding: '10px 14px', margin: '0 0 12px' }}>
          <p style={{ color: '#3a3a3a', fontSize: 12, margin: 0, fontStyle: 'italic' }}>
            Tu pojawi się wiadomość do uczestników z przypomnienia (jeśli wpiszesz coś poniżej).
          </p>
        </div>
      )}

      <p style={{ color: '#e0e0e0', fontSize: 13, margin: '0 0 10px' }}>Czy możesz przyjść?</p>
      <div style={{ margin: '0 0 12px', display: 'flex', gap: 10 }}>
        <span style={{ display: 'inline-block', backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 12, padding: '8px 16px' }}>
          ✓ Potwierdzam uczestnictwo
        </span>
        <span style={{ display: 'inline-block', backgroundColor: '#1a1a1a', color: '#888', fontWeight: 700, fontSize: 12, padding: '8px 16px', border: '1px solid #333' }}>
          ✗ Rezygnuję
        </span>
      </div>

      {organizerEmail && (
        <p style={{ color: '#888', fontSize: 12, margin: '0 0 10px' }}>
          Masz pytania? Napisz do organizatora: <span style={{ color: '#c0392b' }}>{organizerEmail}</span>
        </p>
      )}
      <hr style={{ borderColor: '#333', margin: '0 0 10px' }} />
      <p style={{ color: '#666', fontSize: 12, margin: 0 }}>Do zobaczenia na slamie!</p>
    </div>
  )
}

export default function ReminderModal({
  slam,
  organizerToken,
  formattedDate,
  confirmedCount,
  onSaved,
  onClose,
}: ReminderModalProps) {
  const autoEnabled = slam.reminder_days_before != null
  const [mode, setMode] = useState<'off' | 'auto'>(autoEnabled ? 'auto' : 'off')
  const [daysInput, setDaysInput] = useState(slam.reminder_days_before ? String(slam.reminder_days_before) : '2')
  const [reminderMessage, setReminderMessage] = useState(slam.reminder_message ?? '')
  const [skipOrganizerMessage, setSkipOrganizerMessage] = useState(slam.reminder_skip_organizer_message ?? false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSendNowConfirm, setShowSendNowConfirm] = useState(false)
  const [sendingNow, setSendingNow] = useState(false)

  const alreadySent = !!slam.reminder_sent_at
  const days = parseInt(daysInput, 10)
  const daysValid = !isNaN(days) && days >= 1 && days <= 30

  const handleSave = async () => {
    const daysBefore = mode === 'auto' && daysValid ? days : null
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/${organizerToken}/set-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminder_days_before: daysBefore,
          reminder_message: reminderMessage.trim() || null,
          skip_organizer_message: skipOrganizerMessage,
        }),
      })
      if (!res.ok) throw new Error()
      onSaved({
        reminder_days_before: daysBefore,
        reminder_message: reminderMessage.trim() || null,
        reminder_skip_organizer_message: skipOrganizerMessage,
        reminder_sent_at: null,
      } as Partial<Slam>)
      toast.success('Przypomnienia skonfigurowane!')
      onClose()
    } catch {
      toast.error('Błąd zapisu')
    } finally {
      setSaving(false)
    }
  }

  const handleSendNow = async () => {
    setSendingNow(true)
    try {
      const res = await fetch(`/api/dashboard/${organizerToken}/send-reminder-now`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.status === 409) {
        toast.error('Przypomnienie zostało już wysłane.')
        setShowSendNowConfirm(false)
        return
      }
      if (!res.ok) throw new Error()
      onSaved({ reminder_sent_at: new Date().toISOString() } as Partial<Slam>)
      toast.success(`Wysłano przypomnienia do ${data.sent} uczestników!`)
      onClose()
    } catch {
      toast.error('Błąd wysyłki')
    } finally {
      setSendingNow(false)
      setShowSendNowConfirm(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
          <p className="text-xs font-bold text-[#555] uppercase tracking-widest">
            Przypomnienia dla uczestników
          </p>
          <button onClick={onClose} className="text-[#555] hover:text-[#aaa] text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">

          {/* SEKCJA A: Automatyczne — radio */}
          <div>
            <p className="text-xs font-bold text-[#aaa] uppercase tracking-wider mb-3">
              Automatyczne przypomnienie
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="reminder_mode"
                  checked={mode === 'off'}
                  onChange={() => setMode('off')}
                  className="accent-[#c0392b]"
                />
                <span className="text-sm text-[#aaa] group-hover:text-white transition-colors">
                  Nie wysyłaj automatycznie
                </span>
              </label>
              <label className={`flex items-start gap-3 ${alreadySent ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer group'}`}>
                <input
                  type="radio"
                  name="reminder_mode"
                  checked={mode === 'auto'}
                  onChange={() => !alreadySent && setMode('auto')}
                  disabled={alreadySent}
                  className="accent-[#c0392b] mt-0.5"
                />
                <div className="space-y-1.5">
                  <span className="text-sm text-[#aaa] group-hover:text-white transition-colors">
                    Wyślij automatycznie
                    {alreadySent && <span className="ml-2 text-xs text-[#444]">(już wysłano)</span>}
                  </span>
                  {mode === 'auto' && !alreadySent && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={daysInput}
                        onChange={(e) => setDaysInput(e.target.value)}
                        className="w-16 bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-2 py-1 focus:outline-none focus:border-[#444]"
                      />
                      <span className="text-sm text-[#555]">
                        {daysValid && days === 1 ? 'dzień przed slamem (o 12:00)' : 'dni przed slamem (o 12:00)'}
                      </span>
                    </div>
                  )}
                  {mode === 'auto' && daysValid && !alreadySent && (
                    <p className="text-xs text-[#444]">
                      {(() => {
                        const eventDate = new Date(slam.event_date.replace(' ', 'T'))
                        if (isNaN(eventDate.getTime())) return null
                        const reminderDate = new Date(eventDate)
                        reminderDate.setDate(reminderDate.getDate() - days)
                        const dayNames: Record<number, string> = { 0: 'niedzielę', 1: 'poniedziałek', 2: 'wtorek', 3: 'środę', 4: 'czwartek', 5: 'piątek', 6: 'sobotę' }
                        const eventDay = dayNames[eventDate.getDay()]
                        const reminderDay = dayNames[reminderDate.getDay()]
                        return `Np. jeśli ustawisz ${days}, a slam jest w ${eventDay} → przypomnienie w ${reminderDay} o 12:00`
                      })()}
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Wiadomość + checkbox */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#aaa] uppercase tracking-wider mb-1.5">
                Wiadomość w przypomnieniu (opcjonalnie)
              </label>
              <p className="text-xs text-[#444] mb-2">
                Jeśli puste — użyta zostanie wiadomość od organizatora z dashboardu.
              </p>
              <textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="np. Prosimy o przybycie 15 min wcześniej. Wejście od ul. Brackiej."
                rows={3}
                className="w-full bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444] placeholder:text-[#3a3a3a]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={skipOrganizerMessage}
                onChange={(e) => setSkipOrganizerMessage(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#c0392b]"
              />
              <span className="text-xs text-[#555] group-hover:text-[#aaa] transition-colors">
                Nie dodawaj wiadomości od organizatora z dashboardu
              </span>
            </label>
          </div>

          {/* Podgląd maila */}
          <div>
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-3 py-1.5 transition-colors"
            >
              {showPreview ? 'Ukryj podgląd maila' : 'Podgląd maila z przypomnieniem'}
            </button>

            {showPreview && (
              <div className="mt-3 border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                <ReminderEmailPreview
                  slamName={slam.name}
                  slamDate={formattedDate}
                  reminderMessage={reminderMessage}
                  organizerMessage={skipOrganizerMessage ? '' : (slam.organizer_message ?? '')}
                  organizerEmail={slam.organizer_email ?? undefined}
                />
              </div>
            )}
          </div>

          {/* Zapis ustawień */}
          <div className="flex gap-3 pt-2 border-t border-[#2a2a2a]">
            <button
              onClick={handleSave}
              disabled={saving || (mode === 'auto' && !daysValid)}
              className="text-xs text-white bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 px-4 py-2 transition-colors font-bold"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </button>
            <button
              onClick={onClose}
              className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-4 py-2 transition-colors"
            >
              Anuluj
            </button>
          </div>

          {/* SEKCJA B: Wyślij teraz */}
          <div className="border-t border-[#2a2a2a] pt-5">
            <p className="text-xs font-bold text-[#aaa] uppercase tracking-wider mb-1">
              Wyślij teraz
            </p>

            {alreadySent ? (
              <div className="space-y-2">
                <p className="text-xs text-[#555]">
                  ✓ Przypomnienie zostało już wysłane{' '}
                  <span className="text-[#444]">
                    ({new Date(slam.reminder_sent_at!.replace(' ', 'T')).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })})
                  </span>.
                </p>
                <p className="text-xs text-[#444]">
                  Jeśli chcesz wysłać kolejne — napisz bezpośrednio ze swojego maila do uczestników.
                </p>
              </div>
            ) : showSendNowConfirm ? (
              <div className="bg-[#111] border border-[#c0392b]/40 p-4 space-y-3">
                <p className="text-sm text-white font-bold">
                  Wysłać przypomnienia do {confirmedCount} {confirmedCount === 1 ? 'osoby' : 'osób'} z listy głównej?
                </p>
                <p className="text-xs text-[#888]">
                  Maile zostaną wysłane natychmiast. Tej akcji nie można cofnąć — przypomnienia można wysłać tylko raz, więc automatyczne (jeśli ustawione) już się nie wyślą.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSendNow}
                    disabled={sendingNow}
                    className="text-xs text-white bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 px-3 py-1.5 font-bold transition-colors"
                  >
                    {sendingNow ? 'Wysyłanie...' : 'Tak, wyślij teraz'}
                  </button>
                  <button
                    onClick={() => setShowSendNowConfirm(false)}
                    className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-3 py-1.5 transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#444]">
                  Wyśle maile natychmiast do wszystkich{' '}
                  <span className="text-[#888]">({confirmedCount} os.)</span>{' '}
                  z listy głównej.
                </p>
                <button
                  onClick={() => setShowSendNowConfirm(true)}
                  disabled={confirmedCount === 0}
                  className="text-xs text-[#c0392b] border border-[#c0392b]/50 hover:bg-[#c0392b]/10 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 transition-colors font-bold"
                >
                  Wyślij przypomnienia teraz →
                </button>
                {confirmedCount === 0 && (
                  <p className="text-xs text-[#333]">Brak uczestników na liście głównej.</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
