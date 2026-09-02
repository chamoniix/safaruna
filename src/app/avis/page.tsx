import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicReviews } from '@/lib/public-reviews';
import ReviewsDirectory from './ReviewsDirectory';
import './reviews.css';

export const metadata: Metadata = {
  title: 'Avis clients SAFARUMA | Expériences Omra accompagnée',
  description: 'Retrouvez les retours d’expérience des pèlerins accompagnés par SAFARUMA.',
};

export const dynamic = 'force-dynamic';

export default async function AvisPage() {
  const initialResult = await getPublicReviews({ page: 1, limit: 12 })
    .then(data => ({ data, error: false }))
    .catch(() => ({
      data: { reviews: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1, hasNextPage: false } },
      error: true,
    }));

  return (
    <main className="public-reviews-page">
      <section className="public-reviews-hero">
        <p className="public-reviews-eyebrow">Avis SAFARUMA</p>
        <h1>Leur expérience, notre plus belle récompense.</h1>
        <p>
          Retrouvez ici les avis publiés après validation : retours de membres, expériences vérifiées et avis sur nos Guides.
        </p>
        <Link href="/avis/deposer">Donner mon avis</Link>
      </section>
      <ReviewsDirectory initialData={initialResult.data} initialError={initialResult.error} />
    </main>
  );
}
