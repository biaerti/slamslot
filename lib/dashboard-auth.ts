import crypto from 'crypto'
import { cookies } from 'next/headers'
import { supabase } from './supabase'
import type { Slam } from '@/types'

// Wiersz z bazy - zawiera pola, ktore NIGDY nie moga trafic do przegladarki
export type SlamRow = Slam & {
  dashboard_password_hash: string | null
  password_reset_token: string | null
  password_reset_expires: string | null
}

const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 dni

function sessionSecret(): string {
  const secret = process.env.DASHBOARD_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Brak DASHBOARD_SESSION_SECRET')
  return secret
}

function cookieName(slamId: string) {
  return `ss_dash_${slamId}`
}

// Sesja jest powiazana z aktualnym hashem hasla - zmiana/usuniecie hasla
// automatycznie uniewaznia wszystkie stare sesje.
function sessionValue(slam: SlamRow): string {
  return crypto
    .createHmac('sha256', sessionSecret())
    .update(`${slam.id}|${slam.organizer_token}|${slam.dashboard_password_hash ?? ''}`)
    .digest('hex')
}

export async function getSlamRowByToken(token: string): Promise<SlamRow | null> {
  if (!/^[a-f0-9]{64}$/.test(token)) return null
  const { data } = await supabase
    .from('slams')
    .select('*')
    .eq('organizer_token', token)
    .single()
  return (data as SlamRow | null) ?? null
}

export async function hasDashboardSession(slam: SlamRow): Promise<boolean> {
  if (!slam.dashboard_password_hash) return true // brak hasla = dostep po samym tokenie
  const store = await cookies()
  const value = store.get(cookieName(slam.id))?.value
  if (!value) return false
  const expected = sessionValue(slam)
  const a = Buffer.from(value)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Tylko w Route Handlerach
export async function setDashboardSession(slam: SlamRow) {
  const store = await cookies()
  store.set(cookieName(slam.id), sessionValue(slam), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearDashboardSession(slamId: string) {
  const store = await cookies()
  store.delete(cookieName(slamId))
}

type DashboardAuthResult =
  | { ok: true; slam: SlamRow }
  | { ok: false; response: Response }

// Uzywac na poczatku KAZDEGO routa /api/dashboard/[organizer_token]/...
export async function requireDashboard(token: string): Promise<DashboardAuthResult> {
  const slam = await getSlamRowByToken(token)
  if (!slam) {
    return { ok: false, response: Response.json({ error: 'Nie znaleziono slamu' }, { status: 404 }) }
  }
  if (!(await hasDashboardSession(slam))) {
    return { ok: false, response: Response.json({ error: 'Wymagane hasło' }, { status: 401 }) }
  }
  return { ok: true, slam }
}

// Wersja slamu bezpieczna do wyslania do przegladarki
export function toSafeSlam(slam: SlamRow): Slam {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dashboard_password_hash, password_reset_token, password_reset_expires, ...rest } = slam
  return { ...rest, has_password: !!dashboard_password_hash }
}
