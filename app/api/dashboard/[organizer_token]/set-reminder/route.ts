import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  try {
    const { organizer_token } = await params
    const body = await req.json()
    const { reminder_days_before, reminder_message } = body

    // null = wyłączone, 1 lub 2 = ile dni przed
    if (reminder_days_before !== null && reminder_days_before !== 1 && reminder_days_before !== 2) {
      return Response.json({ error: 'Nieprawidłowa wartość' }, { status: 400 })
    }

    const { data: slam } = await supabase
      .from('slams')
      .select('id')
      .eq('organizer_token', organizer_token)
      .single()

    if (!slam) return Response.json({ error: 'Nie znaleziono slamu' }, { status: 404 })

    await supabase
      .from('slams')
      .update({
        reminder_days_before: reminder_days_before ?? null,
        reminder_message: reminder_message?.trim() || null,
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
