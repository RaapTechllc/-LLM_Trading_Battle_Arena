// Session management for anonymous users
// Replaces hardcoded "demo-user" with cookie-based session IDs

import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'arena_session_id';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Get or create a session ID for the current user.
 * Uses cookies for persistence across requests.
 */
export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existingSession = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (existingSession?.value) {
    return existingSession.value;
  }
  
  // Generate new session ID
  const newSessionId = `user_${uuidv4()}`;
  
  // Note: Setting cookies in Server Components requires the response
  // This will be set by the calling route handler or middleware
  return newSessionId;
}

/**
 * Set the session cookie (call from API routes or middleware)
 */
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Get session ID from request cookies (for API routes)
 */
export function getSessionIdFromRequest(request: Request): string {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...val] = c.split('=');
      return [key, val.join('=')];
    })
  );
  return cookies[SESSION_COOKIE_NAME] || `user_${uuidv4()}`;
}
