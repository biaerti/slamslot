import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const { name, description, location, fb_event_url, event_date, max_participants } = await req.json()

  if (!name?.trim()) {
    return Response.json({ error: 'Nazwa slamu jest wymagana' }, { status: 400 })
  }

  const { error } = await supabase
    .from('slams')
    .update({
      name: name.trim(),
      description: description || null,
      location: location || null,
      fb_event_url: fb_event_url || null,
      ...(event_date ? { event_date } : {}),
      ...(max_participants ? { max_participants: Number(max_participants) } : {}),
    })
    .eq('organizer_token', organizer_token)

  if (error) {
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
