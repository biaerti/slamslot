import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/tokens'
import { requireDashboard, setDashboardSession } from '@/lib/dashboard-auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const auth = await requireDashboard(organizer_token)
  if (!auth.ok) return auth.response
  const slam = auth.slam

  const { password } = await req.json()

  if (typeof password !== 'string' || password.length < 4 || password.length > 100) {
    return Response.json({ error: 'Hasło musi mieć 4-100 znaków' }, { status: 400 })
  }

  const newHash = hashPassword(password)
  const { error } = await supabase
    .from('slams')
    .update({ dashboard_password_hash: newHash })
    .eq('id', slam.id)

  if (error) {
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }

  // Nowa sesja dla osoby, która właśnie ustawiła hasło (stare sesje innych przestają działać)
  await setDashboardSession({ ...slam, dashboard_password_hash: newHash })
  return Response.json({ ok: true })
}
