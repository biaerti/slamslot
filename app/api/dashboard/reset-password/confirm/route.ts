import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/tokens'
import { getSlamRowByToken, setDashboardSession } from '@/lib/dashboard-auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'reset-confirm', 10, 15 * 60 * 1000)
  if (limited) return limited

  const { reset_token, new_password } = await req.json()

  if (typeof reset_token !== 'string' || !/^[a-f0-9]{64}$/.test(reset_token) || typeof new_password !== 'string' || new_password.length < 4 || new_password.length > 100) {
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

  const newHash = hashPassword(new_password)
  await supabase
    .from('slams')
    .update({
      dashboard_password_hash: newHash,
      password_reset_token: null,
      password_reset_expires: null,
    })
    .eq('id', slam.id)

  // Zaloguj od razu osobę, która zresetowała hasło
  const fresh = await getSlamRowByToken(slam.organizer_token)
  if (fresh) await setDashboardSession(fresh)

  return Response.json({ ok: true, organizer_token: slam.organizer_token })
}
