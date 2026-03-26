import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  moveToConfirmed,
  moveToWaiting,
  deleteRegistration,
  promoteFirstFromWaitlist,
} from '@/lib/registrations'
import {
  sendPromotedEmail,
  sendMovedToWaitingEmail,
} from '@/lib/email'

async function getSlamByToken(token: string) {
  const { data } = await supabase
    .from('slams')
    .select('*')
    .eq('organizer_token', token)
    .single()
  return data
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string; reg_id: string }> }
) {
  try {
    const { organizer_token, reg_id } = await params
    const slam = await getSlamByToken(organizer_token)
    if (!slam) return Response.json({ error: 'Nie znaleziono slamu' }, { status: 404 })

    const body = await req.json()
    const action = body.action as 'move_to_confirmed' | 'move_to_waiting'
    const notify = body.notify !== false // domyślnie true

    if (action === 'move_to_confirmed') {
      const updated = await moveToConfirmed(slam.id, reg_id)
      if (updated && notify) {
        sendPromotedEmail({
          to: updated.email,
          participantName: updated.name,
          slamName: slam.name,
          slamDate: slam.event_date,
          position: updated.position,
          organizerMessage: slam.organizer_message,
        })
      }
      return Response.json({ updated: true })
    }

    if (action === 'move_to_waiting') {
      const updated = await moveToWaiting(slam.id, reg_id)
      if (updated && notify) {
        sendMovedToWaitingEmail({
          to: updated.email,
          participantName: updated.name,
          slamName: slam.name,
          slamDate: slam.event_date,
          position: updated.position,
          waitlistToken: updated.waitlist_check_token,
          organizerMessage: slam.organizer_message,
        })
      }
      return Response.json({ updated: true })
    }

    return Response.json({ error: 'Nieznana akcja' }, { status: 400 })
  } catch (err) {
    console.error('[PATCH /api/dashboard/.../registrations/...]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string; reg_id: string }> }
) {
  try {
    const { organizer_token, reg_id } = await params
    const slam = await getSlamByToken(organizer_token)
    if (!slam) return Response.json({ error: 'Nie znaleziono slamu' }, { status: 404 })

    const { wasConfirmed } = await deleteRegistration(slam.id, reg_id)

    // If a confirmed spot was freed, promote first from waitlist
    if (wasConfirmed) {
      const promoted = await promoteFirstFromWaitlist(slam.id)
      if (promoted) {
        sendPromotedEmail({
          to: promoted.email,
          participantName: promoted.name,
          slamName: slam.name,
          slamDate: slam.event_date,
          position: promoted.position,
          organizerMessage: slam.organizer_message,
        })
      }
    }

    return Response.json({ removed: true })
  } catch (err) {
    console.error('[DELETE /api/dashboard/.../registrations/...]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
