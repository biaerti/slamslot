import { supabase } from './supabase'
import { generateToken } from './tokens'
import type { Registration, Slam } from '@/types'

export async function getRegistrationsForDashboard(
  organizerToken: string
): Promise<{ slam: Slam; confirmed: Registration[]; waiting: Registration[]; cancelled: Registration[] } | null> {
  const { data: slam, error: slamError } = await supabase
    .from('slams')
    .select('*')
    .eq('organizer_token', organizerToken)
    .single()

  if (slamError || !slam) return null

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*')
    .eq('slam_id', slam.id)
    .in('status', ['confirmed', 'waiting', 'cancelled'])
    .order('status', { ascending: true })
    .order('position', { ascending: true })

  const confirmed = (registrations ?? []).filter((r) => r.status === 'confirmed')
  const waiting = (registrations ?? []).filter((r) => r.status === 'waiting')
  const cancelled = (registrations ?? []).filter((r) => r.status === 'cancelled')

  return { slam, confirmed, waiting, cancelled }
}

export async function registerParticipant(
  slamId: string,
  data: { name: string; email: string; phone?: string; note?: string }
): Promise<{ status: 'confirmed' | 'waiting'; position: number; waitlistToken: string; cancelToken: string }> {
  const { data: slam } = await supabase
    .from('slams')
    .select('max_participants')
    .eq('id', slamId)
    .single()

  if (!slam) throw new Error('Slam not found')

  const cancelToken = generateToken()

  const { data: result, error } = await supabase.rpc('register_participant', {
    p_slam_id: slamId,
    p_name: data.name,
    p_email: data.email,
    p_phone: data.phone ?? null,
    p_note: data.note ?? null,
    p_waitlist_token: generateToken(),
    p_cancel_token: cancelToken,
  })

  if (error) {
    if (error.message?.includes('duplicate') || error.code === '23505') {
      throw new Error('DUPLICATE_EMAIL')
    }
    throw error
  }

  return {
    status: result.status,
    position: result.position,
    waitlistToken: result.waitlist_token,
    cancelToken,
  }
}

export async function cancelRegistrationByToken(
  cancelToken: string
): Promise<{ name: string; email: string; slamId: string } | null> {
  const { data: reg } = await supabase
    .from('registrations')
    .select('id, name, email, slam_id, status')
    .eq('cancel_token', cancelToken)
    .single()

  if (!reg || reg.status === 'cancelled') return null

  const wasConfirmed = reg.status === 'confirmed'

  await supabase
    .from('registrations')
    .update({ status: 'cancelled', cancelled_by: 'email_link', position: 0 })
    .eq('id', reg.id)

  if (wasConfirmed) {
    await reorderConfirmedList(reg.slam_id)
    await promoteFirstFromWaitlist(reg.slam_id)
  } else {
    await reorderWaitingList(reg.slam_id)
  }

  return { name: reg.name, email: reg.email, slamId: reg.slam_id }
}

export async function promoteFirstFromWaitlist(slamId: string): Promise<Registration | null> {
  const { data: first } = await supabase
    .from('registrations')
    .select('*')
    .eq('slam_id', slamId)
    .eq('status', 'waiting')
    .order('position', { ascending: true })
    .limit(1)
    .single()

  if (!first) return null

  const { data: confirmed } = await supabase
    .from('registrations')
    .select('position')
    .eq('slam_id', slamId)
    .eq('status', 'confirmed')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const newPosition = (confirmed?.position ?? 0) + 1

  const { data: updated } = await supabase
    .from('registrations')
    .update({ status: 'confirmed', position: newPosition })
    .eq('id', first.id)
    .select()
    .single()

  // Reorder the waiting list
  await reorderWaitingList(slamId)

  return updated
}

export async function moveToConfirmed(
  slamId: string,
  registrationId: string
): Promise<Registration | null> {
  const { data: confirmed } = await supabase
    .from('registrations')
    .select('position')
    .eq('slam_id', slamId)
    .eq('status', 'confirmed')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const newPosition = (confirmed?.position ?? 0) + 1

  const { data: updated } = await supabase
    .from('registrations')
    .update({ status: 'confirmed', position: newPosition })
    .eq('id', registrationId)
    .select()
    .single()

  await reorderWaitingList(slamId)

  return updated
}

export async function moveToWaiting(
  slamId: string,
  registrationId: string
): Promise<Registration | null> {
  const { data: waiting } = await supabase
    .from('registrations')
    .select('position')
    .eq('slam_id', slamId)
    .eq('status', 'waiting')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const newPosition = (waiting?.position ?? 0) + 1

  const { data: updated } = await supabase
    .from('registrations')
    .update({ status: 'waiting', position: newPosition })
    .eq('id', registrationId)
    .select()
    .single()

  await reorderConfirmedList(slamId)

  return updated
}

export async function deleteRegistration(
  slamId: string,
  registrationId: string
): Promise<{ wasConfirmed: boolean }> {
  const { data: reg } = await supabase
    .from('registrations')
    .select('status')
    .eq('id', registrationId)
    .single()

  await supabase
    .from('registrations')
    .update({ status: 'cancelled', cancelled_by: 'manual', position: 0 })
    .eq('id', registrationId)

  await reorderConfirmedList(slamId)
  await reorderWaitingList(slamId)

  return { wasConfirmed: reg?.status === 'confirmed' }
}

async function reorderWaitingList(slamId: string) {
  const { data: rows } = await supabase
    .from('registrations')
    .select('id')
    .eq('slam_id', slamId)
    .eq('status', 'waiting')
    .order('position', { ascending: true })
    .order('registered_at', { ascending: true })

  if (!rows?.length) return

  await Promise.all(
    rows.map((row, idx) =>
      supabase
        .from('registrations')
        .update({ position: idx + 1 })
        .eq('id', row.id)
    )
  )
}

async function reorderConfirmedList(slamId: string) {
  const { data: rows } = await supabase
    .from('registrations')
    .select('id')
    .eq('slam_id', slamId)
    .eq('status', 'confirmed')
    .order('position', { ascending: true })
    .order('registered_at', { ascending: true })

  if (!rows?.length) return

  await Promise.all(
    rows.map((row, idx) =>
      supabase
        .from('registrations')
        .update({ position: idx + 1 })
        .eq('id', row.id)
    )
  )
}
