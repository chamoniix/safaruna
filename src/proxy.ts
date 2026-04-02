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

  // ── Pèlerin / Guide routes (NextAuth) ─────────────────
  if (pathname === '/guide/inscription') return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET ?? '' });

  if (!token) {
    return NextResponse.redirect(new URL('/connexion', req.url));
  }
  if (pathname.startsWith('/guide') && token.role !== 'GUIDE' && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/connexion', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/espace/:path*', '/guide/:path*', '/admin/:path*'],
};
