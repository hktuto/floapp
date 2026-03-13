// Simple session management (replace with proper solution later)
import type { H3Event } from 'h3'

interface UserSession {
  user: {
    id: string
    type: string
    identifier: string
  }
}

export async function getUserSession(event: H3Event): Promise<UserSession | null> {
  const session = getCookie(event, 'session')
  if (!session) return null
  try {
    return JSON.parse(session)
  } catch {
    return null
  }
}

export async function setUserSession(event: H3Event, session: UserSession) {
  // Use runtime config for production check
  const config = useRuntimeConfig()
  const isProduction = config.NODE_ENV === 'production'
  
  setCookie(event, 'session', JSON.stringify(session), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}
