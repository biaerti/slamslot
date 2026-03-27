import { supabase } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: slam, error } = await supabase
    .from('slams')
    .select('id, organizer_name, name, description, event_date, max_participants, image_url, location, fb_event_url')
    .eq('id', id)
    .single()

  if (error || !slam) {
    return Response.json({ error: 'Slam nie istnieje' }, { status: 404 })
  }

  const { count: confirmed_count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('slam_id', id)
    .eq('status', 'confirmed')

  const { count: waiting_count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('slam_id', id)
    .eq('status', 'waiting')

  return Response.json({
    ...slam,
    confirmed_count: confirmed_count ?? 0,
    waiting_count: waiting_count ?? 0,
  })
}
