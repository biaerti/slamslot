import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateToken, hashPassword } from '@/lib/tokens'
import { createSlamSchema } from '@/lib/validations'
import { sendOrganizerEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSlamSchema.safeParse(body)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const first = Object.entries(fieldErrors).find(([, msgs]) => msgs && msgs.length > 0)
      const message = first ? `${first[0]}: ${first[1]![0]}` : 'Nieprawidłowe dane'
      return Response.json({ error: message }, { status: 400 })
    }

    const { organizer_name, name, description, fb_event_url, event_date, max_participants, location, organizer_email, image_url, show_spots, dashboard_password, contact_mode } = parsed.data
    const organizer_token = generateToken()

    const { data: slam, error } = await supabase
      .from('slams')
      .insert({
        organizer_name,
        name,
        description,
        event_date,
        max_participants,
        organizer_token,
        location: location || null,
        fb_event_url: fb_event_url || null,
        show_spots: show_spots ?? true,
        organizer_email: organizer_email || null,
        image_url: image_url || null,
        dashboard_password_hash: dashboard_password ? hashPassword(dashboard_password) : null,
        contact_mode: contact_mode ?? 'auto',
      })
      .select()
      .single()

    if (error) throw error

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const public_url = `${baseUrl}/slam/${slam.id}`
    const dashboard_url = `${baseUrl}/dashboard/${organizer_token}`

    // Wyślij email do organizatora jeśli podał adres
    if (organizer_email) {
      await sendOrganizerEmail({
        to: organizer_email,
        slamName: name,
        slamDate: event_date,
        publicUrl: public_url,
        dashboardUrl: dashboard_url,
      })
    }

    return Response.json({ slam_id: slam.id, public_url, dashboard_url, organizer_token })
  } catch (err) {
    console.error('[POST /api/slams]', err)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
