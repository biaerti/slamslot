import { notFound } from 'next/navigation'
import DashboardClient from '@/components/dashboard/dashboard-client'
import type { DashboardData } from '@/types'

export default async function DashboardPage(
  props: { params: Promise<{ organizer_token: string }> }
) {
  const { organizer_token } = await props.params

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/dashboard/${organizer_token}`, {
    cache: 'no-store',
  })

  if (!res.ok) notFound()

  const data: DashboardData = await res.json()

  return <DashboardClient data={data} organizerToken={organizer_token} />
}
