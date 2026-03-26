import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  try {
    const { organizer_token } = await params

    const { data: slam } = await supabase
      .from('slams')
      .select('id')
      .eq('organizer_token', organizer_token)
      .single()

    if (!slam) return Response.json({ error: 'Nie znaleziono slamu' }, { status: 404 })

    // ordered_ids: tablica ID w nowej kolejności dla danego statusu
    const { ordered_ids, status } = await req.json() as {
      ordered_ids: string[]
      status: 'confirmed' | 'waiting'
    }

    if (!Array.isArray(ordered_ids) || !status) {
      return Response.json({ error: 'Nieprawidłowe dane' }, { status: 400 })
    }

    // Aktualizuj pozycje sekwencyjnie
    await Promise.all(
      ordered_ids.map((id, idx) =>
        supabase
          .from('registrations')
          .update({ position: idx + 1 })
          .eq('id', id)
          .eq('slam_id', slam.id)
          .eq('status', status)
      )
    )

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[POST /api/dashboard/.../reorder]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
