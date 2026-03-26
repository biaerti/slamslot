import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const { message } = await req.json()

  const { error } = await supabase
    .from('slams')
    .update({ organizer_message: message || null })
    .eq('organizer_token', organizer_token)

  if (error) {
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
