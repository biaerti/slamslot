import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, isLegacyHash, verifyPassword } from '@/lib/tokens'
import { getSlamRowByToken, setDashboardSession } from '@/lib/dashboard-auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const limited = rateLimit(req, 'verify-password', 10, 15 * 60 * 1000)
  if (limited) return limited

  const { organizer_token } = await params
  const { password } = await req.json().catch(() => ({ password: '' }))

  const slam = await getSlamRowByToken(organizer_token)
  if (!slam) return Response.json({ error: 'Nie znaleziono' }, { status: 404 })
  if (!slam.dashboard_password_hash) return Response.json({ ok: true }) // brak hasła = wolny dostęp

  if (!verifyPassword(password, slam.dashboard_password_hash)) {
    return Response.json({ error: 'Błędne hasło' }, { status: 401 })
  }

  // Przy okazji podnieś stary hash (HMAC) do scrypt
  if (isLegacyHash(slam.dashboard_password_hash)) {
    const newHash = hashPassword(password)
    await supabase.from('slams').update({ dashboard_password_hash: newHash }).eq('id', slam.id)
    slam.dashboard_password_hash = newHash
  }

  await setDashboardSession(slam)
  return Response.json({ ok: true })
}
