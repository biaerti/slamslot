import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  const cutoffStr = cutoff.toISOString()

  // Znajdź slamy starsze niż 90 dni
  const { data: oldSlams } = await supabase
    .from('slams')
    .select('id')
    .lt('event_date', cutoffStr)

  if (!oldSlams?.length) {
    return Response.json({ deleted_registrations: 0, deleted_slams: 0 })
  }

  const slamIds = oldSlams.map((s) => s.id)

  // Usuń rejestracje
  const { count: regCount } = await supabase
    .from('registrations')
    .delete({ count: 'exact' })
    .in('slam_id', slamIds)

  // Usuń slamy
  const { count: slamCount } = await supabase
    .from('slams')
    .delete({ count: 'exact' })
    .in('id', slamIds)

  return Response.json({
    deleted_registrations: regCount ?? 0,
    deleted_slams: slamCount ?? 0,
  })
}
