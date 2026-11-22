import { NextRequest } from 'next/server'
import { requireDashboard } from '@/lib/dashboard-auth'
import { registerParticipant } from '@/lib/registrations'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  try {
    const { organizer_token } = await params
    const auth = await requireDashboard(organizer_token)
    if (!auth.ok) return auth.response
    const slam = auth.slam

    const body = await req.json()
    const name = (body.name ?? '').trim()
    const email = (body.email ?? '').trim()
    const phone = (body.phone ?? '').trim() || undefined
    const note = (body.note ?? '').trim() || undefined

    if (!name || !email) {
      return Response.json({ error: 'Imię i email są wymagane' }, { status: 400 })
    }

    let result
    try {
      result = await registerParticipant(slam.id, { name, email, phone, note })
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'DUPLICATE_EMAIL') {
        return Response.json(
          { error: 'Ten adres email jest już zarejestrowany na to wydarzenie.' },
          { status: 409 }
        )
      }
      throw err
    }

    // No emails sent — organizer handles contact manually
    return Response.json({ status: result.status, position: result.position })
  } catch (err) {
    console.error('[POST /api/dashboard/.../add-participant]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
