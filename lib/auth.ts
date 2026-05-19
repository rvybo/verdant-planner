import { createHmac } from 'crypto'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'Hilux333'
const HMAC_SECRET = 'vp2026-xK9mQ2pL7rW'

export const SESSION_COOKIE = 'vp_session'

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS
}

export function generateSessionToken(): string {
  return createHmac('sha256', HMAC_SECRET).update(`${ADMIN_USER}:${ADMIN_PASS}`).digest('hex')
}

export function isValidToken(token: string): boolean {
  return token === generateSessionToken()
}
