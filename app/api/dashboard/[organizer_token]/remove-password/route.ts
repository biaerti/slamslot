import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { clearDashboardSession, requireDashboard } from '@/lib/dashboard-auth'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const auth = await requireDashboard(organizer_token)
  if (!auth.ok) return auth.response

  const { error } = await supabase
    .from('slams')
    .update({ dashboard_password_hash: null })
    .eq('id', auth.slam.id)

  if (error) {
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }

  await clearDashboardSession(auth.slam.id)
  return Response.json({ ok: true })
}
