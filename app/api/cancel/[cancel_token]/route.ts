import { NextRequest } from 'next/server'
import { cancelRegistrationByToken } from '@/lib/registrations'
import { supabase } from '@/lib/supabase'
import { sendPromotedEmail } from '@/lib/email'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ cancel_token: string }> }
) {
  try {
    const { cancel_token } = await params
    const result = await cancelRegistrationByToken(cancel_token)

    if (!result) {
      return Response.json(
        { error: 'Nieważny link lub zapis już anulowany.' },
        { status: 404 }
      )
    }

    // Jeśli awansował ktoś z rezerwowej — wyślij mu email
    const { data: promoted } = await supabase
      .from('registrations')
      .select('name, email, position, cancel_token')
      .eq('slam_id', result.slamId)
      .eq('status', 'confirmed')
      .order('position', { ascending: false })
      .limit(1)
      .single()

    if (promoted) {
      const { data: slam } = await supabase
        .from('slams')
        .select('name, event_date, organizer_message, organizer_email, contact_mode')
        .eq('id', result.slamId)
        .single()

      if (slam && slam.contact_mode !== 'personal') {
        await sendPromotedEmail({
          to: promoted.email,
          participantName: promoted.name,
          slamName: slam.name,
          slamDate: slam.event_date,
          position: promoted.position,
          cancelToken: promoted.cancel_token,
          organizerMessage: slam.organizer_message,
        })
      }
    }

    return Response.json({ cancelled: true })
  } catch (err) {
    console.error('[POST /api/cancel/...]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
