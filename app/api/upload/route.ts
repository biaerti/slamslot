import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

const BUCKET = 'slam-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

// Rozszerzenie bierzemy z typu wykrytego po zawartości pliku, nie z nazwy podanej przez klienta
function detectImage(buf: Buffer): { ext: string; type: string } | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', type: 'image/jpeg' }
  }
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: 'png', type: 'image/png' }
  }
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return { ext: 'webp', type: 'image/webp' }
  }
  return null
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'upload', 30, 60 * 60 * 1000)
  if (limited) return limited

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) return Response.json({ error: 'Brak pliku' }, { status: 400 })
    if (file.size > MAX_SIZE)
      return Response.json({ error: 'Maksymalny rozmiar pliku: 5 MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const detected = detectImage(buffer)
    if (!detected)
      return Response.json({ error: 'Dozwolone formaty: JPG, PNG, WebP' }, { status: 400 })

    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${detected.ext}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: detected.type })

    if (error) throw error

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)

    return Response.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return Response.json({ error: 'Błąd uploadu' }, { status: 500 })
  }
}
