import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import prisma from '@/lib/prisma'
import { getEffectivePlaceCatalog } from '@/lib/place-catalog'
import GuideProfileClient from './GuideProfileClient'

const NAIM_LANGUAGE_LABELS: Record<string, string> = {
  fr: 'Français',
  ar: 'العربية',
  algerien: 'الجزائرية',
  darija: 'الدارجة',
}

const getGuideData = cache(async (slug: string) => prisma.guideProfile.findFirst({
  where: { slug, status: 'ACTIVE' },
  include: {
    guideAccount: true,
    languages: { orderBy: { languageCode: 'asc' } },
    places: { where: { isActive: true }, select: { placeKey: true } },
    reviews: {
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        pelerin: { select: { firstName: true, country: true, image: true } },
        reservation: { select: { experienceReview: { select: { firstName: true, city: true, country: true } } } },
      },
    },
  },
}))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuideData(slug)
  if (!guide) return { title: 'Guide — SAFARUMA' }
  const name = guide.guideAccount?.displayName || `${guide.guideAccount?.firstName ?? ''} ${guide.guideAccount?.lastName ?? ''}`.trim() || 'Guide SAFARUMA'
  const description = guide.bio || `Profil guide — ${name}`
  return {
    title: `${name} — Guide privé Omra | SAFARUMA`,
    description,
    alternates: { canonical: `https://safaruma.com/guides/${slug}` },
    openGraph: { title: `${name} — SAFARUMA`, description, url: `https://safaruma.com/guides/${slug}` },
  }
}

export async function generateStaticParams() {
  try {
    const guides = await prisma.guideProfile.findMany({ where: { slug: { not: null }, status: 'ACTIVE' }, select: { slug: true } })
    return guides.filter(guide => guide.slug).map(guide => ({ slug: guide.slug! }))
  } catch {
    return []
  }
}

export default async function GuideProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getGuideData(slug)
  if (!guide || !guide.guideAccount) notFound()

  const [placeCatalog, ratingAggregate] = await Promise.all([
    getEffectivePlaceCatalog(),
    prisma.review.aggregate({
      where: { guideProfileId: guide.id, status: 'APPROVED' },
      _avg: { ratingOverall: true },
      _count: { ratingOverall: true },
    }),
  ])

  const account = guide.guideAccount
  const name = account.displayName || `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() || 'Guide SAFARUMA'
  const initials = `${account.firstName?.[0] ?? name[0] ?? 'G'}${account.lastName?.[0] ?? name[1] ?? 'S'}`.toUpperCase()
  const rating = ratingAggregate._count.ratingOverall > 0 ? Math.round((ratingAggregate._avg.ratingOverall ?? 0) * 10) / 10 : null
  const storedLanguageCodes = guide.languages.map(language => language.languageCode)
  const languageCodes = slug === 'naim-laamari'
    ? ['fr', 'ar', 'algerien', 'darija'].filter(code => storedLanguageCodes.includes(code))
    : storedLanguageCodes
  const languages = languageCodes.map(languageCode => (
    slug === 'naim-laamari'
      ? NAIM_LANGUAGE_LABELS[languageCode] || languageCode
      : languageCode
  ))
  const serviceCities = (slug === 'naim-laamari'
    ? [guide.servesMadinah ? 'Médine' : null, guide.servesMakkah ? 'Makkah' : null]
    : [guide.servesMakkah ? 'Makkah' : null, guide.servesMadinah ? 'Médine' : null]
  ).filter(Boolean) as string[]
  const reviews = guide.reviews.map(review => ({
    name: review.reviewerFirstName || review.reservation?.experienceReview?.firstName || review.pelerin.firstName?.trim() || 'Pèlerin',
    avatarUrl: review.pelerin.image,
    country: review.reviewerCity || review.reviewerCountry
      ? [review.reviewerCity, review.reviewerCountry].filter(Boolean).join(', ')
      : review.reservation?.experienceReview
      ? [review.reservation.experienceReview.city, review.reservation.experienceReview.country].filter(Boolean).join(', ')
      : review.pelerin.country || 'Pays non renseigné',
    flag: '',
    date: review.createdAt.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    rating: review.ratingOverall,
    text: review.comment,
  }))
  const guideActivePlaceKeys = new Set(guide.places.map(place => place.placeKey))
  const profilePlaces = placeCatalog
    .filter(place => place.isActive && (place.includedInBase || guideActivePlaceKeys.has(place.key)))
    .map(place => ({ emoji: place.emoji, nameAr: place.nameAr, nameFr: place.nameFr, desc: place.desc, category: place.category }))
  const guideImage = account.image || (slug === 'naim-laamari' ? '/images/landing/guide-naim-laamari.jpg' : null)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: guide.bio || undefined,
    url: `https://safaruma.com/guides/${slug}`,
    knowsLanguage: languageCodes,
    ...(rating !== null ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, reviewCount: ratingAggregate._count.ratingOverall, bestRating: 5, worstRating: 1 } } : {}),
  }

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <Navbar />
    <section className="sfr-public-guide-hero" aria-labelledby="guide-profile-name">
      <div className="sfr-public-guide-container">
        <Link href="/guides" className="sfr-public-guide-back">← Tous les guides</Link>
        <div className="sfr-public-guide-intro">
          <div className="sfr-public-guide-portrait">
            {guideImage ? <Image src={guideImage} alt={name} fill sizes="(max-width: 600px) 128px, 224px" style={{ objectFit: 'cover', objectPosition: slug === 'naim-laamari' ? '62% 42%' : 'center' }} /> : <span>{initials}</span>}
          </div>
          <div className="sfr-public-guide-copy">
            {serviceCities.length > 0 && <p className="sfr-public-guide-cities">{serviceCities.join(' · ')}</p>}
            <h1 id="guide-profile-name">{name}</h1>
            <div className="sfr-public-guide-facts">
              {guide.experienceYears !== null && <span>Expérience : <strong>{guide.experienceYears} ans</strong></span>}
              {rating !== null && <span><span aria-hidden="true" className="sfr-public-guide-star">★</span> <strong>{rating.toFixed(1)} / 5</strong> · {ratingAggregate._count.ratingOverall} avis validés</span>}
            </div>
            {guide.bio?.trim() && <p className="sfr-public-guide-bio">{guide.bio}</p>}
            {languages.length > 0 && <div className="sfr-public-guide-languages" aria-label="Langues parlées">{languages.map(language => <span key={language} dir="auto">{language}</span>)}</div>}
          </div>
        </div>
      </div>
    </section>
    <div style={{ background: '#FAF7F0', minHeight: '70vh' }}>
      <GuideProfileClient
        slug={slug}
        guideName={name}
        isOfficial={slug === 'naim-laamari'}
        rating={rating}
        reviewCount={ratingAggregate._count.ratingOverall}
        packages={[]}
        places={profilePlaces}
        reviews={reviews}
        certifications={guide.university ? [`Études déclarées : ${guide.university}`] : []}
        services={[]}
        bioFull={guide.bio ? [guide.bio] : []}
        languages={languages}
        activePlaceKeys={guide.places.map(place => place.placeKey)}
        includedPlaceKeys={placeCatalog.filter(place => place.isActive && place.includedInBase).map(place => place.key)}
        guideCity={guide.city === 'MAKKAH' || guide.city === 'MADINAH' ? guide.city : undefined}
        acceptingBookings={guide.acceptingBookings}
        servesMakkah={guide.servesMakkah}
        servesMadinah={guide.servesMadinah}
      />
    </div>
    <Footer />
  </>
}
