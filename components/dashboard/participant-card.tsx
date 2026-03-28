'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import type { Registration } from '@/types'

interface ParticipantCardProps {
  registration: Registration
  onMoveToConfirmed?: () => void
  onMoveToWaiting?: () => void
  onDelete: () => void
}

export function ParticipantCard({
  registration,
  onMoveToConfirmed,
  onMoveToWaiting,
  onDelete,
}: ParticipantCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: registration.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isConfirmed = registration.status === 'confirmed'
  const registeredAt = format(new Date(registration.registered_at), 'd MMM yyyy HH:mm', {
    locale: pl,
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#0f0f0f] border border-[#2a2a2a] p-4 group hover:border-[#3a3a3a] transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-[#444] hover:text-[#888] cursor-grab active:cursor-grabbing select-none touch-none"
          title="Przeciągnij"
        >
          ⋮⋮
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">
              #{registration.position} {registration.name}
            </span>
            <Badge variant={isConfirmed ? 'confirmed' : 'waiting'}>
              {isConfirmed ? 'Potwierdzony' : 'Rezerwowy'}
            </Badge>
            {registration.attendance_confirmed && (
              <span
                title="Uczestnik potwierdził uczestnictwo przez link w mailu z przypomnieniem"
                className="text-green-400 text-xs leading-none cursor-default"
              >
                ✓
              </span>
            )}
          </div>
          <p className="text-[#888] text-xs mt-1 truncate">{registration.email}</p>
          {registration.phone && (
            <p className="text-[#666] text-xs">{registration.phone}</p>
          )}
          {registration.note && (
            <p className="text-[#555] text-xs mt-1 italic">&ldquo;{registration.note}&rdquo;</p>
          )}
          <p className="text-[#444] text-xs mt-1">{registeredAt}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isConfirmed && onMoveToWaiting && (
            <Button variant="ghost" size="sm" onClick={onMoveToWaiting} title="Przesuń na rezerwową">
              ↓
            </Button>
          )}
          {!isConfirmed && onMoveToConfirmed && (
            <Button variant="secondary" size="sm" onClick={onMoveToConfirmed} title="Przesuń na główną">
              ↑
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={onDelete} title="Usuń">
            ✕
          </Button>
        </div>
      </div>
    </div>
  )
}
