import { NextRequest, NextResponse } from 'next/server';
import { getAdminActor } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendGuideAccess } from '@/lib/email';
import { randomBytes } from 'node:crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

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
    await prisma.$transaction([
      prisma.guideProfile.update({ where: { slug }, data: { status: 'SUSPENDED' } }),
      ...(guide.guideAccountId ? [prisma.guideAccount.update({ where: { id: guide.guideAccountId }, data: { status: 'SUSPENDED' } })] : []),
      prisma.auditLog.create({ data: { actor: actor.email, actorRole: actor.role, actorAdminId: actor.id, action: 'GUIDE_SUSPENDED', target: guide.id } }),
    ]);
    return NextResponse.json({ success: true, newStatus: 'SUSPENDED', message: 'Profil suspendu.' });
  }

  if (action === 'activate') {
    await prisma.guideProfile.update({
      where: { slug },
      data: {
        status: 'ACTIVE',
        approvedByAdminId: actor.id,
        approvedByEmail: actor.email,
        approvedAt: guide.approvedAt || new Date(),
      },
    });
    if (guide.guideAccountId) {
      await prisma.guideAccount.update({ where: { id: guide.guideAccountId }, data: { status: 'ACTIVE' } });
    }

    if (generatePassword) {
      const password = `${randomBytes(12).toString('base64url')}Aa1!`;
      const hash = await bcrypt.hash(password, 12);

      await prisma.user.update({
        where: { id: guide.user.id },
        data: { passwordHash: hash, emailVerified: new Date() },
      });
      if (guide.guideAccountId) {
        await prisma.guideAccount.update({
          where: { id: guide.guideAccountId },
          data: { passwordHash: hash, emailVerified: new Date(), status: 'ACTIVE' },
        });
      }

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

      await prisma.auditLog.create({ data: { actor: actor.email, actorRole: actor.role, actorAdminId: actor.id, action: 'GUIDE_ACTIVATED_WITH_NEW_ACCESS', target: guide.id } });

      return NextResponse.json({
        success: true,
        newStatus: 'ACTIVE',
        message: 'Profil activé et identifiants envoyés par email.',
      });
    }

    await prisma.auditLog.create({ data: { actor: actor.email, actorRole: actor.role, actorAdminId: actor.id, action: 'GUIDE_ACTIVATED', target: guide.id } });
    return NextResponse.json({ success: true, newStatus: 'ACTIVE', message: 'Profil activé.' });
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
}
