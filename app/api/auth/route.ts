import { NextResponse } from 'next/server'
import { validateCredentials, generateSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: Request) {
  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { username = '', password = '' } = body

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ error: 'Nesprávne prihlasovacie údaje' }, { status: 401 })
  }

  const token = generateSessionToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dní
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
