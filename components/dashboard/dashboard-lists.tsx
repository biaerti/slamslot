'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { ParticipantCard } from './participant-card'
import { MoveDialog } from './move-dialog'
import type { DashboardData, Registration } from '@/types'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface DashboardListsProps {
  data: DashboardData
  organizerToken: string
  onDataChange: (data: DashboardData) => void
  onRefresh: () => Promise<void>
}

interface PendingMove {
  regId: string
  name: string
  direction: 'to_confirmed' | 'to_waiting'
}

export default function DashboardLists({
  data,
  organizerToken,
  onDataChange,
  onRefresh,
}: DashboardListsProps) {
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)
  const [showCancelled, setShowCancelled] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const patchRegistration = async (regId: string, action: string, notify: boolean) => {
    const res = await fetch(
      `/api/dashboard/${organizerToken}/registrations/${regId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notify }),
      }
    )
    if (!res.ok) throw new Error('Błąd serwera')
  }

  const deleteRegistration = async (regId: string) => {
    if (!confirm('Anulować uczestnika? Zostanie oznaczony jako anulowany.')) return
    try {
      const res = await fetch(
        `/api/dashboard/${organizerToken}/registrations/${regId}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Błąd serwera')
      toast.success('Uczestnik anulowany')
      await onRefresh()
    } catch {
      toast.error('Nie udało się anulować uczestnika')
    }
  }

  const confirmMove = async (notify: boolean) => {
    if (!pendingMove) return
    const { regId, direction } = pendingMove
    setPendingMove(null)
    try {
      const action = direction === 'to_confirmed' ? 'move_to_confirmed' : 'move_to_waiting'
      await patchRegistration(regId, action, notify)
      const msg = direction === 'to_confirmed' ? 'Przeniesiono na listę główną' : 'Przeniesiono na listę rezerwową'
      toast.success(notify ? `${msg} — wysłano email` : msg)
      await onRefresh()
    } catch {
      toast.error('Nie udało się przenieść uczestnika')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    const isActiveConfirmed = data.confirmed.some((r) => r.id === activeId)
    const isActiveWaiting = data.waiting.some((r) => r.id === activeId)
    const isOverConfirmed = data.confirmed.some((r) => r.id === overId) || overId === 'confirmed-list'
    const isOverWaiting = data.waiting.some((r) => r.id === overId) || overId === 'waiting-list'

    if (isActiveConfirmed && isOverWaiting) {
      const reg = data.confirmed.find((r) => r.id === activeId)
      if (reg) setPendingMove({ regId: activeId, name: reg.name, direction: 'to_waiting' })
      return
    }
    if (isActiveWaiting && isOverConfirmed) {
      const reg = data.waiting.find((r) => r.id === activeId)
      if (reg) setPendingMove({ regId: activeId, name: reg.name, direction: 'to_confirmed' })
      return
    }

    if (isActiveConfirmed && isOverConfirmed) {
      const oldIndex = data.confirmed.findIndex((r) => r.id === activeId)
      const newIndex = data.confirmed.findIndex((r) => r.id === overId)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(data.confirmed, oldIndex, newIndex)
      onDataChange({ ...data, confirmed: reordered })
      await fetch(`/api/dashboard/${organizerToken}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordered_ids: reordered.map((r) => r.id), status: 'confirmed' }),
      })
    }

    if (isActiveWaiting && isOverWaiting) {
      const oldIndex = data.waiting.findIndex((r) => r.id === activeId)
      const newIndex = data.waiting.findIndex((r) => r.id === overId)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(data.waiting, oldIndex, newIndex)
      onDataChange({ ...data, waiting: reordered })
      await fetch(`/api/dashboard/${organizerToken}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordered_ids: reordered.map((r) => r.id), status: 'waiting' }),
      })
    }
  }

  const totalConfirmed = data.confirmed.length
  const totalWaiting = data.waiting.length
  const totalCancelled = data.cancelled?.length ?? 0

  return (
    <>
      {pendingMove && (
        <MoveDialog
          participantName={pendingMove.name}
          direction={pendingMove.direction}
          onConfirm={confirmMove}
          onCancel={() => setPendingMove(null)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confirmed list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-white tracking-wide">LISTA GŁÓWNA</h2>
              <span className="text-xs text-[#888] border border-[#2a2a2a] px-2 py-0.5">
                {totalConfirmed} / {data.slam.max_participants}
              </span>
            </div>
            <SortableContext
              id="confirmed-list"
              items={data.confirmed.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 min-h-[80px]">
                {data.confirmed.length === 0 && (
                  <div className="border border-dashed border-[#2a2a2a] p-6 text-center text-[#444] text-sm">
                    Brak uczestników na liście głównej
                  </div>
                )}
                {data.confirmed.map((reg) => (
                  <ParticipantCard
                    key={reg.id}
                    registration={reg}
                    onMoveToWaiting={() => setPendingMove({ regId: reg.id, name: reg.name, direction: 'to_waiting' })}
                    onDelete={() => deleteRegistration(reg.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>

          {/* Waiting list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-yellow-400 tracking-wide">LISTA REZERWOWA</h2>
              <span className="text-xs text-[#888] border border-[#2a2a2a] px-2 py-0.5">
                {totalWaiting} osób
              </span>
            </div>
            <SortableContext
              id="waiting-list"
              items={data.waiting.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 min-h-[80px]">
                {data.waiting.length === 0 && (
                  <div className="border border-dashed border-[#2a2a2a] p-6 text-center text-[#444] text-sm">
                    Brak osób na liście rezerwowej
                  </div>
                )}
                {data.waiting.map((reg) => (
                  <ParticipantCard
                    key={reg.id}
                    registration={reg}
                    onMoveToConfirmed={() => setPendingMove({ regId: reg.id, name: reg.name, direction: 'to_confirmed' })}
                    onDelete={() => deleteRegistration(reg.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </div>
      </DndContext>

      {/* Anulowani */}
      {totalCancelled > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowCancelled((v) => !v)}
            className="flex items-center gap-2 text-xs text-[#555] hover:text-[#888] transition-colors mb-3"
          >
            <span>{showCancelled ? '▼' : '▶'}</span>
            <span className="uppercase tracking-wider font-bold">
              Anulowane zapisy ({totalCancelled})
            </span>
          </button>

          {showCancelled && (
            <div className="space-y-1.5">
              {data.cancelled.map((reg) => (
                <CancelledRow key={reg.id} registration={reg} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function CancelledRow({ registration }: { registration: Registration }) {
  const cancelledAt = format(new Date(registration.registered_at), 'd MMM yyyy HH:mm', { locale: pl })
  const source = registration.cancelled_by === 'email_link' ? 'przez link w mailu' : 'ręcznie przez organizatora'

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] text-sm opacity-80">
      <span className="text-[#c0392b] font-mono text-xs">✕</span>
      <span className="text-[#666] flex-1 truncate">{registration.name}</span>
      <span className="text-[#444] text-xs truncate hidden sm:block">{registration.email}</span>
      <span className="text-[#444] text-xs shrink-0">{source}</span>
      <span className="text-[#333] text-xs shrink-0 hidden md:block">{cancelledAt}</span>
    </div>
  )
}
