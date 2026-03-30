import { NextRequest, NextResponse } from 'next/server';
import { Locale } from './i18n/config';
import { SanitizedUser, Token } from '@workspace/types';

export const ROOT = '/';
export const PUBLIC_ROUTES = [
  '/auth/(signin|signout|error|.*)',
  '/auth/[^/]+/otp',
];
export const DEFAULT_REDIRECT = '/auth/signin';
export const defaultLocale = 'de';
export const locales = ['en', 'de', 'fr', 'it', 'es'];

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|onboarding).*)'],
};

const COOKIE_NAME = 'NEXT_LOCALE';

export default async function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user');
  const tokenCookie = request.cookies.get('token');

  let session: any = null;
  if (userCookie && tokenCookie) {
    try {
      const user: SanitizedUser = JSON.parse(userCookie.value);
      const token: Token = JSON.parse(tokenCookie.value);

      const now = Date.now();
      const expiresAt = token.expiresAt;
      const issuedAt = token.issuedAt;

      const isTokenValid =
        issuedAt && expiresAt && now >= issuedAt && now <= expiresAt;

      if (isTokenValid) {
        session = { user, token };
      }
    } catch (err) {
      console.error('Error parsing session cookies:', err);
    }
  }

  const isAuthenticated = !!(
    session?.user &&
    session?.token &&
    session?.token.accessToken
  );

  const { origin, pathname } = request.nextUrl;

  // Locale detection
  const acceptLanguage = request.headers.get('accept-language');
  const extractedLocale = acceptLanguage?.match(/^[a-z]{2}/i)?.[0];
  const locale = locales.includes(extractedLocale || '')
    ? (extractedLocale as Locale)
    : (defaultLocale as Locale);

  let userLocale = request.cookies.get(COOKIE_NAME)?.value as
    | Locale
    | undefined;
  if (!userLocale) {
    userLocale = locale;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    new RegExp(route).test(pathname)
  );

  if (isPublicRoute) {
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, userLocale);
    response.headers.set('x-user-locale', userLocale);
    return response;
  }

  if (!isAuthenticated) {
    const response = NextResponse.redirect(new URL(DEFAULT_REDIRECT, origin));
    response.cookies.set(COOKIE_NAME, userLocale);
    response.headers.set('x-user-locale', userLocale);
    return response;
  }

  if (isAuthenticated && pathname.startsWith('/auth')) {
    const response = NextResponse.redirect(new URL(ROOT, origin));
    response.cookies.set(COOKIE_NAME, userLocale);
    response.headers.set('x-user-locale', userLocale);
    return response;
  }

  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, userLocale);
  response.headers.set('x-user-locale', userLocale);
  return response;
}
