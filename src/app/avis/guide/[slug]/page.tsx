import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { Star } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import GuideReviewForm from './GuideReviewForm'
import '../../deposer/review-form.css'

export const metadata: Metadata = {
  title: 'Donner mon avis sur un Guide | SAFARUMA',
  description: 'Partagez votre expérience avec un Guide SAFARUMA.',
  robots: { index: false, follow: true },
}

export const dynamic = 'force-dynamic'

export default async function SubmitGuideReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [session, guide] = await Promise.all([
    getServerSession(authOptions),
    prisma.guideProfile.findFirst({
      where: { slug, status: 'ACTIVE' },
      select: { slug: true, guideAccount: { select: { displayName: true, firstName: true, lastName: true } } },
    }),
  ])
  if (!guide || !guide.guideAccount || !guide.slug) notFound()
  const account = guide.guideAccount
  const guideName = account.displayName || [account.firstName, account.lastName].filter(Boolean).join(' ') || 'Guide SAFARUMA'
  const redirectPath = `/avis/guide/${guide.slug}`
  const redirect = encodeURIComponent(redirectPath)

  return (
    <main className="member-review-page">
      <div className="member-review-glow" />
      <section className="member-review-card" aria-labelledby="guide-review-title">
        <Link className="member-review-brand" href="/">SAFAR<span>U</span>MA</Link>
        <div className="member-review-icon" aria-hidden="true"><Star size={25} fill="currentColor" /></div>
        <p className="member-review-salam">Salam alaykoum</p>
        <h1 id="guide-review-title">Votre avis sur {guideName}.</h1>
        <p className="member-review-intro">
          SAFARUMA vous remercie de prendre le temps de partager votre expérience avec ce Guide. Votre retour nous aide à améliorer la qualité de nos accompagnements.
        </p>

        {session?.user ? (
          <GuideReviewForm slug={guide.slug} guideName={guideName} />
        ) : (
          <div className="member-review-auth">
            <p>Connectez-vous ou créez gratuitement votre compte pour publier votre avis sur ce Guide.</p>
            <Link className="member-review-primary" href={`/connexion?redirect=${redirect}`}>Me connecter</Link>
            <Link className="member-review-secondary" href={`/inscription?redirect=${redirect}`}>Créer mon compte</Link>
          </div>
        )}
      </section>
    </main>
  )
}
