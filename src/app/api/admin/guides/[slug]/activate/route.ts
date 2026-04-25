import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendGuideAccess } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();
  const { action, generatePassword } = body as { action: 'activate' | 'suspend'; generatePassword?: boolean };

  const guide = await prisma.guideProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true, email: true, name: true, firstName: true, lastName: true } },
    },
  });

  if (!guide) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });

  if (action === 'suspend') {
    await prisma.guideProfile.update({ where: { slug }, data: { status: 'SUSPENDED' } });
    return NextResponse.json({ success: true, newStatus: 'SUSPENDED', message: 'Profil suspendu.' });
  }

  if (action === 'activate') {
    await prisma.guideProfile.update({ where: { slug }, data: { status: 'ACTIVE' } });

    if (generatePassword) {
      const password =
        Math.random().toString(36).slice(2, 10).toUpperCase() +
        Math.random().toString(36).slice(2, 6) +
        '!';
      const hash = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: guide.user.id },
        data: { passwordHash: hash, emailVerified: new Date() },
      });

      const userEmail = guide.user.email ?? '';
      const userName = guide.user.name || guide.user.firstName || 'Guide';
      if (userEmail) {
        try {
          await sendGuideAccess({
            to: userEmail,
            name: userName,
            email: userEmail,
            password,
            loginUrl: 'https://safaruma.com/guide/connexion',
          });
        } catch (e) {
          console.error('[activate] email error', e);
        }
      }

      return NextResponse.json({
        success: true,
        newStatus: 'ACTIVE',
        password,
        message: 'Profil activé et identifiants envoyés par email.',
      });
    }

    return NextResponse.json({ success: true, newStatus: 'ACTIVE', message: 'Profil activé.' });
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
}
