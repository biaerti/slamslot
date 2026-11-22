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
  const { name, organizer_name, description, location, fb_event_url, show_spots, event_date, max_participants, image_url } = await req.json()

  if (!name?.trim()) {
    return Response.json({ error: 'Nazwa slamu jest wymagana' }, { status: 400 })
  }

  const { error } = await supabase
    .from('slams')
    .update({
      name: name.trim(),
      ...(organizer_name?.trim() ? { organizer_name: organizer_name.trim() } : {}),
      description: description || null,
      location: location || null,
      fb_event_url: fb_event_url || null,
      ...(typeof show_spots === 'boolean' ? { show_spots } : {}),
      ...(event_date ? { event_date } : {}),
      ...(max_participants ? { max_participants: Number(max_participants) } : {}),
      ...(image_url !== undefined ? { image_url: image_url || null } : {}),
    })
    .eq('id', slam.id)

  if (error) {
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
