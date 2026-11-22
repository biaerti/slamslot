import { getRegistrationsForDashboard } from '@/lib/registrations'
import { requireDashboard } from '@/lib/dashboard-auth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await params
  const auth = await requireDashboard(organizer_token)
  if (!auth.ok) return auth.response

  const data = await getRegistrationsForDashboard(auth.slam)
  return Response.json(data, { headers: { 'Cache-Control': 'no-store' } })
}
