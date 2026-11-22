import crypto from 'crypto'

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Format: scrypt$<salt hex>$<hash hex>
const SCRYPT_KEYLEN = 64

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  return `scrypt$${salt}$${hash}`
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex')
  const bufB = Buffer.from(b, 'hex')
  if (bufA.length === 0 || bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

export function verifyPassword(password: string, stored: string): boolean {
  if (typeof password !== 'string' || !password) return false

  if (stored.startsWith('scrypt$')) {
    const [, salt, hash] = stored.split('$')
    if (!salt || !hash) return false
    const check = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
    return safeEqualHex(check, hash)
  }

  // Stary format (salt:hmac-sha256) - nadal akceptowany, po udanym logowaniu przehashowujemy
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const check = crypto.createHmac('sha256', salt).update(password).digest('hex')
  return safeEqualHex(check, hash)
}

export function isLegacyHash(stored: string): boolean {
  return !stored.startsWith('scrypt$')
}
