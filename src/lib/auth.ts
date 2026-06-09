import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-super-secret-key-that-is-at-least-32-chars-long'
)

export interface UserSession {
  id: string
  username: string
  role: 'ADMIN' | 'MANAGER' | 'MESSENGER'
  name: string
}

export async function encrypt(payload: UserSession) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(JWT_SECRET)
}

export async function decrypt(input: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(input, JWT_SECRET, {
      algorithms: ['HS256'],
    })
    return payload as unknown as UserSession
  } catch {
    return null
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return await decrypt(token)
}
