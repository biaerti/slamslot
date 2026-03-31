import { NextRequest } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { registerParticipant } from '@/lib/registrations'
import { sendConfirmedEmail, sendWaitlistEmail } from '@/lib/email'
import { supabase } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'Nieprawidłowe dane', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, phone, note } = parsed.data

    let result
    try {
      result = await registerParticipant(id, { name, email, phone, note })
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'DUPLICATE_EMAIL') {
        return Response.json(
          { error: 'Ten adres email jest już zarejestrowany na to wydarzenie.' },
          { status: 409 }
        )
      }
      throw err
    }

    // Fetch slam for email context
    const { data: slam } = await supabase
      .from('slams')
      .select('name, event_date, organizer_message, organizer_email, contact_mode')
      .eq('id', id)
      .single()

    if (slam && slam.contact_mode !== 'personal') {
      if (result.status === 'confirmed') {
        await sendConfirmedEmail({
          to: email,
          participantName: name,
          slamName: slam.name,
          slamDate: slam.event_date,
          position: result.position,
          cancelToken: result.cancelToken,
          organizerMessage: slam.organizer_message,
          organizerEmail: slam.organizer_email,
        })
      } else {
        await sendWaitlistEmail({
          to: email,
          participantName: name,
          slamName: slam.name,
          slamDate: slam.event_date,
          position: result.position,
          waitlistToken: result.waitlistToken,
          organizerMessage: slam.organizer_message,
        })
      }
    }

    return Response.json({ status: result.status, position: result.position, contact_mode: slam?.contact_mode ?? 'auto' })
  } catch (err) {
    console.error('[POST /api/slams/[id]/register]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
