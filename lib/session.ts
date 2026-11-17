import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Role, Session } from './types'

const COOKIE_NAME = 'pb_session'
const MAX_AGE_SECONDS = 60 * 60 * 8

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not configured.')
  return secret
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function verifyAdminPassword(password: string) {
  return safeEqual(password, process.env.ADMIN_PASSWORD ?? 'admin123')
}

export async function createSession(session: Session) {
  const payload = Buffer.from(
    JSON.stringify({ ...session, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  ).toString('base64url')
  const isProd = process.env.NODE_ENV === 'production'

  const store = await cookies()
  store.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: true,
    // The v0 preview runs inside an iframe, which needs SameSite=None in development.
    sameSite: isProd ? 'lax' : 'none',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const raw = store.get(COOKIE_NAME)?.value
  if (!raw) return null

  const [payload, signature] = raw.split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null
    if (typeof data.name !== 'string' || !data.name) return null
    if (data.role === 'admin') return { role: 'admin', name: data.name }
    if (data.role === 'user' && typeof data.userId === 'string' && data.userId) {
      return { role: 'user', name: data.name, userId: data.userId }
    }
    return null
  } catch {
    return null
  }
}

export async function requireRole<R extends Role>(
  role: R,
): Promise<Extract<Session, { role: R }>> {
  const session = await getSession()
  if (!session) redirect('/')
  if (session.role !== role) redirect(session.role === 'admin' ? '/admin' : '/user')
  return session as Extract<Session, { role: R }>
}
