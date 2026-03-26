import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET = 'slam-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return Response.json({ error: 'Brak pliku' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return Response.json({ error: 'Dozwolone formaty: JPG, PNG, WebP' }, { status: 400 })
    if (file.size > MAX_SIZE)
      return Response.json({ error: 'Maksymalny rozmiar pliku: 5 MB' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: file.type })

    if (error) throw error

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)

    return Response.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return Response.json({ error: 'Błąd uploadu' }, { status: 500 })
  }
}
