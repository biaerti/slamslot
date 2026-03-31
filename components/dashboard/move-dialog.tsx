'use client'

import { useState } from 'react'

interface MoveDialogProps {
  participantName: string
  direction: 'to_confirmed' | 'to_waiting'
  onConfirm: (notify: boolean) => void
  onCancel: () => void
  personalMode?: boolean
}

export function MoveDialog({ participantName, direction, onConfirm, onCancel, personalMode }: MoveDialogProps) {
  const [notify, setNotify] = useState(true)

  const isToConfirmed = direction === 'to_confirmed'
  const title = isToConfirmed
    ? 'Przenieść na listę główną?'
    : 'Przenieść na listę rezerwową?'
  const description = isToConfirmed
    ? `${participantName} zostanie przeniesiony/a z listy rezerwowej na główną.`
    : `${participantName} zostanie przeniesiony/a z listy głównej na rezerwową.`
  const confirmLabel = isToConfirmed ? 'Przenieś na główną' : 'Przenieś na rezerwową'
  const confirmClass = isToConfirmed
    ? 'flex-1 bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-bold py-2 transition-colors'
    : 'flex-1 bg-[#c0392b] hover:bg-[#a93226] text-white text-xs font-bold py-2 transition-colors'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#141414] border border-[#2a2a2a] p-6 w-full max-w-sm">
        <p className="font-bold text-white text-base mb-1">{title}</p>
        <p className={`text-[#888] text-sm ${personalMode ? 'mb-6' : 'mb-5'}`}>{description}</p>

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

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(notify)}
            className={confirmClass}
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
