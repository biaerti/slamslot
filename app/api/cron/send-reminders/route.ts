import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  // Weryfikacja Vercel Cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Znajdź slamy gdzie reminder jest skonfigurowany i jeszcze nie wysłany
  const { data: slams } = await supabase
    .from('slams')
    .select('id, name, event_date, organizer_email, organizer_message, reminder_days_before, reminder_message, reminder_skip_organizer_message')
    .not('reminder_days_before', 'is', null)
    .is('reminder_sent_at', null)

  if (!slams?.length) {
    return Response.json({ sent: 0 })
  }

  let totalSent = 0

  for (const slam of slams) {
    const eventDate = new Date(slam.event_date)
    const daysBefore = slam.reminder_days_before as number

    // Sprawdź czy teraz jest właściwy czas (dzień X przed eventem, w oknie 12:00-13:00)
    const targetDate = new Date(eventDate)
    targetDate.setDate(targetDate.getDate() - daysBefore)
    targetDate.setHours(12, 0, 0, 0)

    const windowStart = new Date(targetDate)
    const windowEnd = new Date(targetDate)
    windowEnd.setHours(13, 0, 0, 0)

    if (now < windowStart || now > windowEnd) continue

    // Pobierz uczestników z listy głównej
    const { data: registrations } = await supabase
      .from('registrations')
      .select('name, email, waitlist_check_token, cancel_token')
      .eq('slam_id', slam.id)
      .eq('status', 'confirmed')

    if (!registrations?.length) {
      // Oznacz jako wysłane (nawet jeśli nie ma uczestników)
      await supabase.from('slams').update({ reminder_sent_at: now.toISOString() }).eq('id', slam.id)
      continue
    }

    // Wyślij maile do wszystkich uczestników
    await Promise.all(
      registrations.map((reg) =>
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

    totalSent += registrations.length

    // Oznacz slam jako przypomniano
    await supabase
      .from('slams')
      .update({ reminder_sent_at: now.toISOString() })
      .eq('id', slam.id)
  }

  return Response.json({ sent: totalSent })
}
