'use client'

import { useRouter } from 'next/navigation'
import { DashboardPasswordGate } from './dashboard-password-gate'

// Po poprawnym haśle serwer ustawia ciasteczko sesji, a refresh
// renderuje stronę ponownie - tym razem już z danymi.
export function DashboardLocked({ organizerToken }: { organizerToken: string }) {
  const router = useRouter()
  return <DashboardPasswordGate organizerToken={organizerToken} onSuccess={() => router.refresh()} />
}
