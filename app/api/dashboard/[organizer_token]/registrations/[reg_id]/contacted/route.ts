import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

async function getSlamByToken(token: string) {
  const { data } = await supabase
    .from('slams')
    .select('id')
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
    const contacted = Boolean(body.contacted)

    const { error } = await supabase
      .from('registrations')
      .update({ contacted })
      .eq('id', reg_id)
      .eq('slam_id', slam.id)

    if (error) throw error

    return Response.json({ updated: true })
  } catch (err) {
    console.error('[PATCH /api/dashboard/.../registrations/.../contacted]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
