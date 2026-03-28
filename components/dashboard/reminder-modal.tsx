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
  const [daysBefore, setDaysBefore] = useState<number | null>(slam.reminder_days_before ?? null)
  const [daysInput, setDaysInput] = useState(slam.reminder_days_before ? String(slam.reminder_days_before) : '')
  const [reminderMessage, setReminderMessage] = useState(slam.reminder_message ?? '')
  const [skipOrganizerMessage, setSkipOrganizerMessage] = useState(slam.reminder_skip_organizer_message ?? false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [sendingNow, setSendingNow] = useState(false)
  const [confirmSendNow, setConfirmSendNow] = useState(false)

  const alreadySent = !!slam.reminder_sent_at

  const handleDaysInput = (val: string) => {
    setDaysInput(val)
    const n = parseInt(val, 10)
    if (val === '' || val === '0') {
      setDaysBefore(null)
    } else if (!isNaN(n) && n >= 1 && n <= 30) {
      setDaysBefore(n)
    }
  }

  const handleSave = async () => {
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
    if (!confirmSendNow) {
      setConfirmSendNow(true)
      return
    }
    setSendingNow(true)
    try {
      const res = await fetch(`/api/dashboard/${organizerToken}/send-reminder-now`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.status === 409) {
        toast.error('Przypomnienie zostało już wysłane.')
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
      setConfirmSendNow(false)
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

          {/* SEKCJA A: Automatyczne */}
          <div>
            <p className="text-xs font-bold text-[#aaa] uppercase tracking-wider mb-1">
              Wyślij automatycznie przed slamem
            </p>
            <p className="text-xs text-[#444] mb-3">
              Cron wysyła codziennie o 12:00. Wpisz 0 lub zostaw puste żeby wyłączyć.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={30}
                value={daysInput}
                onChange={(e) => handleDaysInput(e.target.value)}
                placeholder="np. 2"
                className="w-20 bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 focus:outline-none focus:border-[#444] placeholder:text-[#333]"
              />
              <span className="text-sm text-[#555]">
                {daysBefore ? `${daysBefore === 1 ? 'dzień' : 'dni'} przed slamem (o 12:00)` : 'nie wysyłaj automatycznie'}
              </span>
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

          {/* Zapis ustawień automatycznych */}
          <div className="flex gap-3 pt-2 border-t border-[#2a2a2a]">
            <button
              onClick={handleSave}
              disabled={saving}
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
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#444]">
                  Wyśle przypomnienie natychmiast do wszystkich{' '}
                  <span className="text-[#888]">({confirmedCount} os.)</span>{' '}
                  z listy głównej. Można wysłać tylko raz.
                </p>

                {confirmSendNow ? (
                  <div className="bg-[#111] border border-[#c0392b]/40 p-3 space-y-3">
                    <p className="text-xs text-[#c0392b] font-bold">
                      Na pewno? Wyśle maile do {confirmedCount} {confirmedCount === 1 ? 'osoby' : 'osób'} z listy głównej. Tej akcji nie można cofnąć.
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
                        onClick={() => setConfirmSendNow(false)}
                        className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-3 py-1.5 transition-colors"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSendNow}
                    disabled={confirmedCount === 0}
                    className="text-xs text-[#c0392b] border border-[#c0392b]/50 hover:bg-[#c0392b]/10 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 transition-colors font-bold"
                  >
                    Wyślij przypomnienia teraz →
                  </button>
                )}

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
