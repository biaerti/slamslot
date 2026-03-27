import { resend } from './resend'
import { render } from '@react-email/components'
import ConfirmedEmail from '@/components/emails/confirmed-email'
import WaitlistEmail from '@/components/emails/waitlist-email'
import PromotedEmail from '@/components/emails/promoted-email'
import MovedToWaitingEmail from '@/components/emails/moved-to-waiting-email'
import OrganizerEmail from '@/components/emails/organizer-email'
import ReminderEmail from '@/components/emails/reminder-email'

const FROM = process.env.EMAIL_FROM ?? 'noreply@slamslot.pl'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

function waitlistUrl(token: string) {
  return `${BASE_URL}/waitlist/${token}`
}

function cancelUrl(token: string) {
  return `${BASE_URL}/cancel/${token}`
}

function confirmAttendanceUrl(token: string) {
  return `${BASE_URL}/reminder/confirm/${token}`
}

async function sendEmail(to: string, subject: string, html: string) {
  await resend.emails.send({ from: FROM, to, subject, html })
}

export async function sendConfirmedEmail(params: {
  to: string
  participantName: string
  slamName: string
  slamDate: string
  position: number
  cancelToken?: string
  organizerMessage?: string | null
  organizerEmail?: string | null
}) {
  try {
    const html = await render(ConfirmedEmail({
      participantName: params.participantName,
      slamName: params.slamName,
      slamDate: params.slamDate,
      position: params.position,
      cancelUrl: params.cancelToken ? cancelUrl(params.cancelToken) : undefined,
      organizerMessage: params.organizerMessage ?? undefined,
      organizerEmail: params.organizerEmail ?? undefined,
    }))
    await sendEmail(params.to, `Zapis potwierdzony — ${params.slamName}`, html)
  } catch (err) {
    console.error('[email] sendConfirmedEmail failed', err)
  }
}

export async function sendWaitlistEmail(params: {
  to: string
  participantName: string
  slamName: string
  slamDate: string
  position: number
  waitlistToken: string
  organizerMessage?: string | null
}) {
  try {
    const html = await render(WaitlistEmail({
      participantName: params.participantName,
      slamName: params.slamName,
      slamDate: params.slamDate,
      position: params.position,
      checkPositionUrl: waitlistUrl(params.waitlistToken),
      organizerMessage: params.organizerMessage ?? undefined,
    }))
    await sendEmail(params.to, `Lista rezerwowa — ${params.slamName}`, html)
  } catch (err) {
    console.error('[email] sendWaitlistEmail failed', err)
  }
}

export async function sendPromotedEmail(params: {
  to: string
  participantName: string
  slamName: string
  slamDate: string
  position: number
  cancelToken?: string | null
  organizerMessage?: string | null
}) {
  try {
    const html = await render(PromotedEmail({
      participantName: params.participantName,
      slamName: params.slamName,
      slamDate: params.slamDate,
      position: params.position,
      cancelUrl: params.cancelToken ? cancelUrl(params.cancelToken) : undefined,
      organizerMessage: params.organizerMessage ?? undefined,
    }))
    await sendEmail(params.to, `Dostałeś/łaś się! — ${params.slamName}`, html)
  } catch (err) {
    console.error('[email] sendPromotedEmail failed', err)
  }
}

export async function sendMovedToWaitingEmail(params: {
  to: string
  participantName: string
  slamName: string
  slamDate: string
  position: number
  waitlistToken: string
  organizerMessage?: string | null
}) {
  try {
    const html = await render(MovedToWaitingEmail({
      participantName: params.participantName,
      slamName: params.slamName,
      slamDate: params.slamDate,
      position: params.position,
      checkPositionUrl: waitlistUrl(params.waitlistToken),
      organizerMessage: params.organizerMessage ?? undefined,
    }))
    await sendEmail(params.to, `Zmiana na liście rezerwowej — ${params.slamName}`, html)
  } catch (err) {
    console.error('[email] sendMovedToWaitingEmail failed', err)
  }
}

export async function sendReminderEmail(params: {
  to: string
  participantName: string
  slamName: string
  slamDate: string
  waitlistToken: string
  cancelToken?: string | null
  organizerMessage?: string | null
  organizerEmail?: string | null
  reminderMessage?: string | null
}) {
  try {
    const html = await render(ReminderEmail({
      participantName: params.participantName,
      slamName: params.slamName,
      slamDate: params.slamDate,
      confirmUrl: confirmAttendanceUrl(params.waitlistToken),
      cancelUrl: params.cancelToken ? cancelUrl(params.cancelToken) : undefined,
      organizerMessage: params.organizerMessage ?? undefined,
      organizerEmail: params.organizerEmail ?? undefined,
      reminderMessage: params.reminderMessage ?? undefined,
    }))
    await sendEmail(params.to, `Przypomnienie — jutro ${params.slamName}`, html)
  } catch (err) {
    console.error('[email] sendReminderEmail failed', err)
  }
}

export async function sendOrganizerEmail(params: {
  to: string
  slamName: string
  slamDate: string
  publicUrl: string
  dashboardUrl: string
}) {
  try {
    const html = await render(OrganizerEmail({
      slamName: params.slamName,
      slamDate: params.slamDate,
      publicUrl: params.publicUrl,
      dashboardUrl: params.dashboardUrl,
    }))
    await sendEmail(params.to, `Twój slam "${params.slamName}" jest gotowy — SlamSlot`, html)
  } catch (err) {
    console.error('[email] sendOrganizerEmail failed', err)
  }
}
