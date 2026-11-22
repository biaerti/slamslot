import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireDashboard } from '@/lib/dashboard-auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const auth = await requireDashboard(organizer_token)
  if (!auth.ok) return auth.response
  const slam = auth.slam
  const { message } = await req.json()

  const { error } = await supabase
    .from('slams')
    .update({ organizer_message: message || null })
    .eq('id', slam.id)

  if (error) {
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
