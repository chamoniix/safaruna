import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isIndividualAdminToken, readVerifiedAdminToken } from '@/lib/admin-auth';

async function hasIndividualAdminSession(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || !session) return false;
  return isIndividualAdminToken(await readVerifiedAdminToken(session, secret));
}

function buildCspResponse(req: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''} https://js.stripe.com https://*.sentry.io`,
    "frame-src https://js.stripe.com https://checkout.stripe.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://*.sentry.io https://*.ingest.de.sentry.io https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "upgrade-insecure-requests",
  ].join('; ');

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin page routes ─────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return buildCspResponse(req);
    if (!await hasIndividualAdminSession(req)) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return buildCspResponse(req);
  }

  // ── Admin API routes (defense-in-depth) ───────────────
  if (pathname.startsWith('/api/admin')) {
    if (!await hasIndividualAdminSession(req)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    return buildCspResponse(req);
  }

  // ── Public guide routes ───────────────────────────────
  if (pathname === '/guide/inscription') return buildCspResponse(req);
  if (pathname === '/guide/connexion') return buildCspResponse(req);

  const hasGuideSession = Boolean(req.cookies.get('guide_session')?.value);

  // ── API guide protégées (contrôle rapide, complété dans chaque route)
  const isPublicGuideApi = pathname === '/api/guide/inscription'
    || pathname === '/api/guide/inscription/email-availability'
    || pathname.startsWith('/api/guide/public/')
    || pathname.startsWith('/api/guide/auth/');
  if (pathname.startsWith('/api/guide/') && !isPublicGuideApi) {
    if (!hasGuideSession) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // ── Routes guide protégées : contrôle optimiste du cookie opaque.
  // Chaque lecture ou mutation sensible revalide ensuite la session en base.
  if (pathname.startsWith('/guide/')) {
    if (!hasGuideSession) {
      const loginUrl = new URL('/guide/connexion', req.url);
      loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const token = nextAuthSecret ? await getToken({ req, secret: nextAuthSecret }) : null;
  const role = (token?.role as string) || '';

  // ── API pèlerin protégées (contrôle rapide, complété dans chaque route)
  if (pathname.startsWith('/api/espace/')) {
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (role !== 'PELERIN') return NextResponse.json({ error: 'Accès réservé aux pèlerins' }, { status: 403 });
  }

  // ── Routes pèlerin → redirige vers /connexion si pas PELERIN
  // On préserve le chemin + les query params (slug, forfait, dates…) pour
  // que l'utilisateur reprenne son tunnel de réservation après connexion,
  // au lieu d'atterrir sur le tableau de bord générique.
  if (pathname.startsWith('/espace/')) {
    if (!token || role !== 'PELERIN') {
      const loginUrl = new URL('/connexion', req.url);
      loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return buildCspResponse(req);
}

export const config = {
  matcher: [
    '/espace/:path*',
    '/guide/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/guide/:path*',
    '/api/espace/:path*',
  ],
};
