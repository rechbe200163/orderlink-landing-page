'use server';
import { cookies } from 'next/headers';
export async function setCookie<T>(name: string, data: T): Promise<void> {
  const cookieStore = await cookies();

  const expiresAt =
    typeof data === 'object' &&
    data !== null &&
    'expiresAt' in data &&
    typeof (data as any).expiresAt === 'number'
      ? new Date((data as any).expiresAt)
      : new Date(Date.now() + 30 * 60 * 1000); // Fallback

  cookieStore.set(name, JSON.stringify(data), {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });
}

export async function getCookie<T = any>(name: string): Promise<T | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);

  if (!cookie) return null;

  try {
    return JSON.parse(cookie.value) as T;
  } catch (e) {
    console.error(`Failed to parse cookie "${name}":`, e);
    return null;
  }
}

export async function deleteCookie(name: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
