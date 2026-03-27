import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateToken } from '@/lib/tokens'
import { Resend } from 'resend'
import ResetPasswordEmail from '@/components/emails/reset-password-email'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { organizer_token } = await req.json()

  if (!organizer_token) {
    return Response.json({ error: 'Brak tokenu' }, { status: 400 })
  }

  const { data: slam } = await supabase
    .from('slams')
    .select('id, name, organizer_email')
    .eq('organizer_token', organizer_token)
    .single()

  if (!slam) {
    return Response.json({ ok: true }) // nie ujawniamy czy istnieje
  }

  if (!slam.organizer_email) {
    return Response.json({ error: 'Brak adresu email organizatora. Nie można wysłać resetu.' }, { status: 400 })
  }

  const resetToken = generateToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1h

  await supabase
    .from('slams')
    .update({ password_reset_token: resetToken, password_reset_expires: expiresAt })
    .eq('organizer_token', organizer_token)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const resetUrl = `${baseUrl}/dashboard/reset-password/${resetToken}`

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: slam.organizer_email,
    subject: `Reset hasła — ${slam.name}`,
    react: ResetPasswordEmail({ slamName: slam.name, resetUrl }),
  })

  return Response.json({ ok: true })
}
