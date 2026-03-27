import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/tokens'

export async function POST(req: NextRequest) {
  const { reset_token, new_password } = await req.json()

  if (!reset_token || !new_password || new_password.length < 4) {
    return Response.json({ error: 'Nieprawidłowe dane' }, { status: 400 })
  }

  const { data: slam } = await supabase
    .from('slams')
    .select('id, organizer_token, password_reset_expires')
    .eq('password_reset_token', reset_token)
    .single()

  if (!slam) {
    return Response.json({ error: 'Nieprawidłowy lub wygasły link.' }, { status: 400 })
  }

  if (slam.password_reset_expires && new Date(slam.password_reset_expires) < new Date()) {
    return Response.json({ error: 'Link wygasł. Poproś o nowy reset.' }, { status: 400 })
  }

  await supabase
    .from('slams')
    .update({
      dashboard_password_hash: hashPassword(new_password),
      password_reset_token: null,
      password_reset_expires: null,
    })
    .eq('id', slam.id)

  return Response.json({ ok: true, organizer_token: slam.organizer_token })
}
