import { getRegistrationsForDashboard } from '@/lib/registrations'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const data = await getRegistrationsForDashboard(organizer_token)

  if (!data) {
    return Response.json({ error: 'Nie znaleziono slamu' }, { status: 404 })
  }

  return Response.json(data)
}
