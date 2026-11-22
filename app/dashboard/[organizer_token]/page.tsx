import { notFound } from 'next/navigation'
import DashboardClient from '@/components/dashboard/dashboard-client'
import { DashboardLocked } from '@/components/dashboard/dashboard-locked'
import { getSlamRowByToken, hasDashboardSession } from '@/lib/dashboard-auth'
import { getRegistrationsForDashboard } from '@/lib/registrations'

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardPage(
  props: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await props.params

  const slam = await getSlamRowByToken(organizer_token)
  if (!slam) notFound()

  // Bez ważnej sesji (gdy jest hasło) do HTML-a nie trafiają ŻADNE dane uczestników
  if (!(await hasDashboardSession(slam))) {
    return <DashboardLocked organizerToken={organizer_token} />
  }

  const data = await getRegistrationsForDashboard(slam)
  return <DashboardClient data={data} organizerToken={organizer_token} />
}
