'use client'

import { useState } from 'react'

interface MoveDialogProps {
  participantName: string
  direction: 'to_confirmed' | 'to_waiting'
  onConfirm: (opts: { notify: boolean; backfill: boolean }) => void
  onCancel: () => void
  personalMode?: boolean
  firstWaitingName?: string
  lastConfirmedName?: string
}

export function MoveDialog({
  participantName,
  direction,
  onConfirm,
  onCancel,
  personalMode,
  firstWaitingName,
  lastConfirmedName,
}: MoveDialogProps) {
  const [notify, setNotify] = useState(true)
  const [backfill, setBackfill] = useState(true)

  const isToConfirmed = direction === 'to_confirmed'
  const title = isToConfirmed
    ? 'Przenieść na listę główną?'
    : 'Przenieść na listę rezerwową?'
  const description = isToConfirmed
    ? `${participantName} zostanie przeniesiony/a z listy rezerwowej na główną.`
    : `${participantName} zostanie przeniesiony/a z listy głównej na rezerwową.`
  const confirmLabel = isToConfirmed ? 'Przenieś na główną' : 'Przenieś na rezerwową'

  // Opis efektu checkboxa "dopełnij drugą listę"
  const backfillLabel = isToConfirmed
    ? 'Zepchnij ostatnią osobę z głównej na rezerwową'
    : 'Awansuj pierwszą osobę z rezerwowej na zwolnione miejsce'
  const backfillTargetName = isToConfirmed ? lastConfirmedName : firstWaitingName
  const backfillAvailable = Boolean(backfillTargetName)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#141414] border border-[#2a2a2a] p-6 w-full max-w-sm">
        <p className="font-bold text-white text-base mb-1">{title}</p>
        <p className="text-[#888] text-sm mb-4">{description}</p>

        {backfillAvailable && (
          <label className="flex items-start gap-3 cursor-pointer mb-4 group">
            <input
              type="checkbox"
              checked={backfill}
              onChange={(e) => setBackfill(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#c0392b] shrink-0"
            />
            <span className="text-sm text-[#aaa] group-hover:text-white transition-colors">
              {backfillLabel}
              {backfillTargetName && (
                <span className="text-[#666]"> ({backfillTargetName})</span>
              )}
            </span>
          </label>
        )}

        {!personalMode && (
          <label className="flex items-center gap-3 cursor-pointer mb-6 group">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="w-4 h-4 accent-[#c0392b]"
            />
            <span className="text-sm text-[#aaa] group-hover:text-white transition-colors">
              Powiadom uczestnika mailem
            </span>
          </label>
        )}

        {personalMode && <div className="mb-6" />}

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm({ notify, backfill: backfillAvailable && backfill })}
            className="flex-1 bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-bold py-2 transition-colors"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-[#2a2a2a] text-[#888] hover:text-white text-sm py-2 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  )
}
