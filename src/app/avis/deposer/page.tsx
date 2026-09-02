import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { Star } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import MemberReviewForm from './MemberReviewForm'
import './review-form.css'

export const metadata: Metadata = {
  title: 'Donner mon avis | SAFARUMA',
  description: 'Partagez simplement votre expérience avec SAFARUMA.',
  robots: { index: false, follow: true },
}

export const dynamic = 'force-dynamic'

export default async function SubmitReviewPage() {
  const session = await getServerSession(authOptions)
  const redirect = encodeURIComponent('/avis/deposer')

  return (
    <main className="member-review-page">
      <div className="member-review-glow" />
      <section className="member-review-card" aria-labelledby="member-review-title">
        <Link className="member-review-brand" href="/">SAFAR<span>U</span>MA</Link>
        <div className="member-review-icon" aria-hidden="true"><Star size={25} fill="currentColor" /></div>
        <p className="member-review-salam">Salam alaykoum</p>
        <h1 id="member-review-title">Votre avis compte pour nous.</h1>
        <p className="member-review-intro">
          SAFARUMA vous remercie de prendre le temps de nous donner votre avis général. Votre retour nous aide à nous améliorer.
        </p>

        {session?.user ? (
          <MemberReviewForm />
        ) : (
          <div className="member-review-auth">
            <p>Connectez-vous ou créez gratuitement votre compte pour publier votre avis.</p>
            <Link className="member-review-primary" href={`/connexion?redirect=${redirect}`}>Me connecter</Link>
            <Link className="member-review-secondary" href={`/inscription?redirect=${redirect}`}>Créer mon compte</Link>
          </div>
        )}
      </section>
    </main>
  )
}
