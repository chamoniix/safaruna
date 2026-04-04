import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin routes ──────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    const session = req.cookies.get('admin_session')?.value;
    const secret  = process.env.ADMIN_JWT_SECRET ?? '';
    if (!session || !(await verifyAdminToken(session, secret))) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  // ── Public guide routes ───────────────────────────────
  if (pathname === '/guide/inscription') return NextResponse.next();
  if (pathname === '/guide/connexion') return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET ?? '' });
  const role = (token?.role as string) || '';

  // ── Routes guide protégées → redirige vers /guide/connexion si pas GUIDE
  if (pathname.startsWith('/guide/tableau-de-bord') ||
      pathname.startsWith('/guide/missions') ||
      pathname.startsWith('/guide/demandes') ||
      pathname.startsWith('/guide/revenus') ||
      pathname.startsWith('/guide/calendrier') ||
      pathname.startsWith('/guide/messages') ||
      pathname.startsWith('/guide/profil') ||
      pathname.startsWith('/guide/avis') ||
      pathname.startsWith('/guide/forfaits')) {
    if (!token || (role !== 'GUIDE' && role !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/guide/connexion', req.url));
    }
  }

  // ── Routes pèlerin → redirige vers /connexion si pas PELERIN
  if (pathname.startsWith('/espace/')) {
    if (!token) {
      return NextResponse.redirect(new URL('/connexion', req.url));
    }
    if (role !== 'PELERIN' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/connexion', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/espace/:path*', '/guide/:path*', '/admin/:path*'],
};
