import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const email = (session.user as any).email as string
  const user = await prisma.user.findUnique({
    where: { email },
    select: { name: true, firstName: true, lastName: true }
  })
  const guideName = user?.name
    || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
    || email

  const { suggestion } = await req.json()
  if (!suggestion?.trim()) return NextResponse.json({ error: 'Suggestion vide' }, { status: 400 })

  await sendEmail({
    to: { email: 'admin@safaruma.com', name: 'Admin SAFARUMA' },
    subject: `[Suggestion lieu] ${guideName}`,
    html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:40px 16px;">
<tr><td align="center"><table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
<tr><td style="background:#1A1209;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
  <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:white;">SAFAR<span style="color:#C9A84C;">U</span>MA</span>
</td></tr>
<tr><td style="background:white;padding:40px;border:1px solid #E8DFC8;border-top:none;">
  <h2 style="font-family:Georgia,serif;font-size:20px;color:#1A1209;margin:0 0 16px;">Suggestion de nouveau lieu</h2>
  <p style="font-size:14px;color:#4A3F30;line-height:1.7;">Le guide <strong>${guideName}</strong> propose d'ajouter un nouveau lieu :</p>
  <blockquote style="border-left:4px solid #C9A84C;margin:16px 0;padding:12px 16px;background:#FEF9EC;color:#4A3F30;font-size:14px;line-height:1.7;">${suggestion.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</blockquote>
</td></tr>
<tr><td style="background:#F5F0E8;border:1px solid #E8DFC8;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
  <p style="margin:0;font-size:11px;color:#9A8D7A;">SAFARUMA — <a href="https://safaruma.com" style="color:#C9A84C;text-decoration:none;">safaruma.com</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`,
  })

  return NextResponse.json({ success: true })
}
