'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { DashboardData } from '@/types'
import { DashboardPasswordGate } from './dashboard-password-gate'
import EmailPreviewModal from './email-preview-modal'
import EditSlamModal from './edit-slam-section'
import ReminderModal from './reminder-modal'
import SetPasswordModal from './set-password-modal'

const DashboardLists = dynamic(() => import('./dashboard-lists'), { ssr: false })

interface DashboardClientProps {
  data: DashboardData
  organizerToken: string
}

export default function DashboardClient({ data: initialData, organizerToken }: DashboardClientProps) {
  const [unlocked, setUnlocked] = useState(!initialData.slam.dashboard_password_hash)
  const [data, setData] = useState(initialData)
  const [message, setMessage] = useState(initialData.slam.organizer_message ?? '')
  const [messageSaving, setMessageSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [showSetPassword, setShowSetPassword] = useState(false)

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/dashboard/${organizerToken}`)
    if (res.ok) {
      const fresh = await res.json()
      setData(fresh)
    }
  }, [organizerToken])

  const saveMessage = async () => {
    setMessageSaving(true)
    try {
      await fetch(`/api/dashboard/${organizerToken}/set-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      toast.success('Wiadomość zapisana')
    } catch {
      toast.error('Błąd zapisu')
    } finally {
      setMessageSaving(false)
    }
  }

  if (!unlocked) {
    return <DashboardPasswordGate organizerToken={organizerToken} onSuccess={() => setUnlocked(true)} />
  }

  const copyPublicLink = async () => {
    const baseUrl = window.location.origin
    const url = `${baseUrl}/slam/${data.slam.id}`
    await navigator.clipboard.writeText(url)
    toast.success('Link skopiowany!')
  }

  const dateObj = new Date(data.slam.event_date.replace(' ', 'T'))
  const formattedDate = isNaN(dateObj.getTime())
    ? data.slam.event_date
    : format(dateObj, "d MMMM yyyy, HH:mm", { locale: pl })
  const totalConfirmed = data.confirmed.length
  const totalWaiting = data.waiting.length
  const spotsLeft = data.slam.max_participants - totalConfirmed

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <p className="font-display text-2xl tracking-widest text-white">SLAMSLOT</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSetPassword(true)}
            className="text-[#555] hover:text-[#aaa] text-sm transition-colors"
          >
            {data.slam.dashboard_password_hash ? 'Zmień hasło' : 'Ustaw hasło'}
          </button>
          <button
            onClick={refresh}
            className="text-[#555] hover:text-[#aaa] text-sm transition-colors"
          >
            Odśwież
          </button>
        </div>
      </header>

      {/* Slam info */}
      <div className="border-b border-[#2a2a2a] px-6 py-6 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-1">
                Dashboard organizatora
              </p>
              <h1 className="font-display text-4xl text-white">{data.slam.name}</h1>
              <p className="text-[#888] text-sm mt-1">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <p className="font-display text-3xl text-white">{totalConfirmed}</p>
                <p className="text-xs text-[#888] uppercase tracking-wider">Lista główna</p>
              </div>
              <div className="w-px h-10 bg-[#2a2a2a]" />
              <div>
                <p className="font-display text-3xl text-yellow-400">{totalWaiting}</p>
                <p className="text-xs text-[#888] uppercase tracking-wider">Rezerwowi</p>
              </div>
              <div className="w-px h-10 bg-[#2a2a2a]" />
              <div>
                <p className="font-display text-3xl text-[#c0392b]">{spotsLeft}</p>
                <p className="text-xs text-[#888] uppercase tracking-wider">Wolnych miejsc</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              onClick={copyPublicLink}
              className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-3 py-1.5 transition-colors"
            >
              Kopiuj link dla uczestników
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-3 py-1.5 transition-colors"
            >
              Edytuj dane slamu
            </button>
            <button
              onClick={() => setShowReminder(true)}
              className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-3 py-1.5 transition-colors"
            >
              {data.slam.reminder_days_before
                ? `Przypomnienia: ${data.slam.reminder_days_before} ${data.slam.reminder_days_before === 1 ? 'dzień przed' : 'dni przed'}`
                : 'Skonfiguruj przypomnienia'}
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditSlamModal
          slam={data.slam}
          organizerToken={organizerToken}
          onSaved={(updated) => setData((d) => ({ ...d, slam: { ...d.slam, ...updated } }))}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showSetPassword && (
        <SetPasswordModal
          organizerToken={organizerToken}
          hasPassword={!!data.slam.dashboard_password_hash}
          onSaved={() => setData((d) => ({ ...d, slam: { ...d.slam, dashboard_password_hash: 'set' } }))}
          onClose={() => setShowSetPassword(false)}
        />
      )}

      {showReminder && (
        <ReminderModal
          slam={data.slam}
          organizerToken={organizerToken}
          formattedDate={formattedDate}
          confirmedCount={totalConfirmed}
          onSaved={(updated) => setData((d) => ({ ...d, slam: { ...d.slam, ...updated } }))}
          onClose={() => setShowReminder(false)}
        />
      )}

      {/* Organizer message */}
      <div className="border-b border-[#2a2a2a] px-6 py-5 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold text-[#555] uppercase tracking-widest mb-2">
            Wiadomość od organizatora
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="np. Wejście od ul. Brackiej, przyjdź 15 min wcześniej. Mamy dla Ciebie kawę ☕"
            rows={2}
            className="w-full bg-[#111] border border-[#2a2a2a] text-[#aaa] text-sm px-3 py-2 resize-none focus:outline-none focus:border-[#444] placeholder:text-[#3a3a3a]"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={saveMessage}
              disabled={messageSaving}
              className="text-xs text-white bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-50 px-3 py-1.5 transition-colors"
            >
              {messageSaving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="text-xs text-[#555] hover:text-[#aaa] border border-[#2a2a2a] px-3 py-1.5 transition-colors"
            >
              Podgląd maila
            </button>
            <span className="text-xs text-[#3a3a3a]">
              Ta wiadomość pojawi się w każdym mailu do uczestników.
            </span>
          </div>
        </div>
      </div>

      {showPreview && (
        <EmailPreviewModal
          slamName={data.slam.name}
          slamDate={formattedDate}
          organizerMessage={message}
          organizerEmail={data.slam.organizer_email ?? undefined}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Lists */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <DashboardLists
            data={data}
            organizerToken={organizerToken}
            onDataChange={setData}
            onRefresh={refresh}
          />

          <p className="mt-8 text-xs text-[#444] text-center">
            Przeciągaj karty między listami lub używaj przycisków ↑↓.
            Każda zmiana wysyła automatyczny email do uczestnika.
          </p>
        </div>
      </div>
    </div>
  )
}
