import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
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
        pelerin: { select: { firstName: true, country: true } },
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
    name: review.reservation.experienceReview?.firstName || review.pelerin.firstName?.trim() || 'Pèlerin',
    country: review.reservation.experienceReview
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
  const realStats = [
    ratingAggregate._count.ratingOverall > 0 ? { value: String(ratingAggregate._count.ratingOverall), label: 'Avis vérifiés' } : null,
    guide.experienceYears !== null ? { value: `${guide.experienceYears} ans`, label: 'Expérience' } : null,
  ].filter(Boolean) as Array<{ value: string; label: string }>
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
    <section style={{ background: '#1A1209', padding: '8rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(201,168,76,.15), transparent 65%)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {guideImage ? <div style={{ position: 'relative', width: 112, height: 112, margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #C9A84C' }}><Image src={guideImage} alt={name} fill sizes="112px" style={{ objectFit: 'cover', objectPosition: slug === 'naim-laamari' ? '62% 42%' : 'center' }} /></div> : <div style={{ width: 112, height: 112, margin: '0 auto 16px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#F0D897,#C9A84C)', color: '#1A1209', fontSize: 35, fontWeight: 800, border: '3px solid #C9A84C' }}>{initials}</div>}
        <h1 style={{ color: 'white', margin: '0 0 8px', fontSize: 'clamp(2rem,5vw,3rem)' }}>{name}</h1>
        {serviceCities.length > 0 && <div style={{ color: '#C9A84C', fontWeight: 800, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>{serviceCities.join(' · ')}</div>}
        {rating !== null && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, margin: '18px 0', color: 'white' }}><span style={{ color: '#C9A84C', letterSpacing: 2 }}>★★★★★</span><strong>{rating.toFixed(1)}</strong><span style={{ color: 'rgba(255,255,255,.55)' }}>({ratingAggregate._count.ratingOverall} avis)</span></div>}
        {guide.bio && <p style={{ color: 'rgba(255,255,255,.7)', maxWidth: 650, lineHeight: 1.8, margin: '18px auto' }}>{guide.bio}</p>}
        {realStats.length > 0 && <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', margin: '24px 0' }}>{realStats.map(stat => <div key={stat.label} style={{ minWidth: 130, padding: 15, borderRadius: 13, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(201,168,76,.25)' }}><div style={{ color: '#F0D897', fontSize: 24, fontWeight: 800 }}>{stat.value}</div><div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>{stat.label}</div></div>)}</div>}
        {languages.length > 0 && <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>{languages.map(language => <span key={language} style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.8)', fontSize: 12 }}>{language}</span>)}</div>}
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
