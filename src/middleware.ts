import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyAdminToken } from '@/lib/admin-auth';

function buildCspResponse(req: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''} https://js.stripe.com https://*.sentry.io`,
    "frame-src https://js.stripe.com https://checkout.stripe.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://*.sentry.io https://*.ingest.de.sentry.io",
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
    const session = req.cookies.get('admin_session')?.value;
    const secret  = process.env.ADMIN_JWT_SECRET;
    if (!secret || !session || !(await verifyAdminToken(session, secret))) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return buildCspResponse(req);
  }

  // ── Admin API routes (defense-in-depth) ───────────────
  if (pathname.startsWith('/api/admin')) {
    const session = req.cookies.get('admin_session')?.value;
    const secret  = process.env.ADMIN_JWT_SECRET;
    if (!secret || !session || !(await verifyAdminToken(session, secret))) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    return buildCspResponse(req);
  }

  // ── Public guide routes ───────────────────────────────
  if (pathname === '/guide/inscription') return buildCspResponse(req);
  if (pathname === '/guide/connexion') return buildCspResponse(req);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET ?? 'fallback-dev-only' });
  const role = (token?.role as string) || '';

  // ── Routes guide protégées → redirige vers /guide/connexion si pas GUIDE
  if (
    pathname.startsWith('/guide/tableau-de-bord') ||
    pathname.startsWith('/guide/missions') ||
    pathname.startsWith('/guide/demandes') ||
    pathname.startsWith('/guide/revenus') ||
    pathname.startsWith('/guide/calendrier') ||
    pathname.startsWith('/guide/messages') ||
    pathname.startsWith('/guide/profil') ||
    pathname.startsWith('/guide/avis') ||
    pathname.startsWith('/guide/forfaits')
  ) {
    if (!token || (role !== 'GUIDE' && role !== 'ADMIN')) {
      const loginUrl = new URL('/guide/connexion', req.url);
      loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Routes pèlerin → redirige vers /connexion si pas PELERIN
  // On préserve le chemin + les query params (slug, forfait, dates…) pour
  // que l'utilisateur reprenne son tunnel de réservation après connexion,
  // au lieu d'atterrir sur le tableau de bord générique.
  if (pathname.startsWith('/espace/')) {
    if (!token || (role !== 'PELERIN' && role !== 'ADMIN')) {
      const loginUrl = new URL('/connexion', req.url);
      loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return buildCspResponse(req);
}

export const config = {
  matcher: ['/espace/:path*', '/guide/:path*', '/admin/:path*', '/api/admin/:path*'],
};
