import crypto from 'crypto'

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const check = crypto.createHmac('sha256', salt).update(password).digest('hex')
  return check === hash
}
