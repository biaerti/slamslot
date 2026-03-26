import { supabase } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ waitlist_check_token: string }> }
) {
  const { waitlist_check_token } = await params

  const { data: reg } = await supabase
    .from('registrations')
    .select('name, position, status, slam_id')
    .eq('waitlist_check_token', waitlist_check_token)
    .single()

  if (!reg) {
    return Response.json({ error: 'Nie znaleziono zapisu' }, { status: 404 })
  }

  const { data: slam } = await supabase
    .from('slams')
    .select('name, event_date')
    .eq('id', reg.slam_id)
    .single()

  return Response.json({
    name_initial: reg.name.charAt(0).toUpperCase(),
    position: reg.position,
    status: reg.status,
    slam_name: slam?.name ?? '',
    slam_date: slam?.event_date ?? '',
  })
}
