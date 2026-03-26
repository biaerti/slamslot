import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPassword } from '@/lib/tokens'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const { password } = await req.json()

  const { data: slam } = await supabase
    .from('slams')
    .select('dashboard_password_hash')
    .eq('organizer_token', organizer_token)
    .single()

  if (!slam) return Response.json({ error: 'Nie znaleziono' }, { status: 404 })
  if (!slam.dashboard_password_hash) return Response.json({ ok: true }) // brak hasła = wolny dostęp

  const ok = verifyPassword(password, slam.dashboard_password_hash)
  if (!ok) return Response.json({ error: 'Błędne hasło' }, { status: 401 })

  return Response.json({ ok: true })
}
