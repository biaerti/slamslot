// Prosty limiter w pamieci procesu. Na Vercelu instancje funkcji sa wspoldzielone
// miedzy requestami (Fluid Compute), wiec to realnie hamuje spam z jednego IP,
// ale nie jest twarda gwarancja - do tego sluza reguly Vercel Firewall.

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Zwraca Response 429 jesli limit przekroczony, w przeciwnym razie null.
 * @param name   nazwa limitu (np. 'register')
 * @param limit  ile requestow w oknie
 * @param windowMs dlugosc okna w ms
 */
export function rateLimit(req: Request, name: string, limit: number, windowMs: number): Response | null {
  const now = Date.now()
  const key = `${name}:${clientIp(req)}`
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
  } else {
    bucket.count++
    if (bucket.count > limit) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
      return Response.json(
        { error: 'Za dużo prób. Spróbuj ponownie za chwilę.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }
  }

  // sprzatanie, zeby mapa nie rosla w nieskonczonosc
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
  }
  return null
}
