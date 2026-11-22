import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireDashboard } from '@/lib/dashboard-auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  try {
    const { organizer_token } = await params
    const body = await req.json()
    const { reminder_days_before, reminder_message } = body

    // null = wyłączone, liczba 1-30 = ile dni przed
    if (reminder_days_before !== null && (typeof reminder_days_before !== 'number' || reminder_days_before < 1 || reminder_days_before > 30)) {
      return Response.json({ error: 'Nieprawidłowa wartość' }, { status: 400 })
    }

    const auth = await requireDashboard(organizer_token)
    if (!auth.ok) return auth.response
    const slam = auth.slam

    const { skip_organizer_message } = body

    await supabase
      .from('slams')
      .update({
        reminder_days_before: reminder_days_before ?? null,
        reminder_message: reminder_message?.trim() || null,
        reminder_skip_organizer_message: skip_organizer_message === true,
        // reset sent_at jeśli organizator zmienia ustawienia (żeby ponownie wysłać)
        reminder_sent_at: null,
      })
      .eq('id', slam.id)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[POST set-reminder]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
