import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/tokens'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const { password } = await req.json()

  if (!password || password.length < 4) {
    return Response.json({ error: 'Hasło musi mieć min. 4 znaki' }, { status: 400 })
  }

  const { error } = await supabase
    .from('slams')
    .update({ dashboard_password_hash: hashPassword(password) })
    .eq('organizer_token', organizer_token)

  if (error) {
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
