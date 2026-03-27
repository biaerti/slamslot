import { supabase } from '@/lib/supabase'

export async function GET() {
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('slams')
    .select('id, name, location, event_date')
    .gte('event_date', now)
    .order('event_date', { ascending: true })

  return Response.json(data ?? [])
}
