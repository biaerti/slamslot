import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const { data: reg } = await supabase
      .from('registrations')
      .select('id, status, attendance_confirmed')
      .eq('waitlist_check_token', token)
      .single()

    if (!reg) return Response.json({ error: 'Nieważny link' }, { status: 404 })
    if (reg.status !== 'confirmed') return Response.json({ error: 'Nie jesteś na liście głównej' }, { status: 400 })

    await supabase
      .from('registrations')
      .update({ attendance_confirmed: true })
      .eq('id', reg.id)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[POST reminder/confirm]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
