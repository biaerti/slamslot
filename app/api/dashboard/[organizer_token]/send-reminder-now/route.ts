import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params

  const { data: slam } = await supabase
    .from('slams')
    .select('id, name, event_date, organizer_email, organizer_message, reminder_message, reminder_skip_organizer_message, reminder_sent_at')
    .eq('organizer_token', organizer_token)
    .single()

  if (!slam) return Response.json({ error: 'Nie znaleziono slamu' }, { status: 404 })

  if (slam.reminder_sent_at) {
    return Response.json({ error: 'already_sent', sent_at: slam.reminder_sent_at }, { status: 409 })
  }

  const { data: registrations } = await supabase
    .from('registrations')
    .select('name, email, waitlist_check_token, cancel_token')
    .eq('slam_id', slam.id)
    .eq('status', 'confirmed')

  const count = registrations?.length ?? 0

  if (count > 0) {
    await Promise.all(
      registrations!.map((reg) =>
        sendReminderEmail({
          to: reg.email,
          participantName: reg.name,
          slamName: slam.name,
          slamDate: slam.event_date,
          waitlistToken: reg.waitlist_check_token,
          cancelToken: reg.cancel_token,
          organizerMessage: slam.reminder_skip_organizer_message ? null : slam.organizer_message,
          organizerEmail: slam.organizer_email,
          reminderMessage: slam.reminder_message,
        })
      )
    )
  }

  await supabase
    .from('slams')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', slam.id)

  return Response.json({ ok: true, sent: count })
}
