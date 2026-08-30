import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import prisma from '@/lib/prisma'
import { getEffectivePlaceCatalog } from '@/lib/place-catalog'
import { publicReviewerName } from '@/lib/guide-workflow'
import GuideProfileClient from './GuideProfileClient'

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
      include: { pelerin: { select: { firstName: true, lastName: true, country: true } } },
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
  const languages = guide.languages.map(language => language.languageCode)
  const serviceCities = [guide.servesMakkah ? 'Makkah' : null, guide.servesMadinah ? 'Médine' : null].filter(Boolean) as string[]
  const reviews = guide.reviews.map(review => ({
    name: publicReviewerName(review.pelerin.firstName, review.pelerin.lastName),
    country: review.pelerin.country || 'Pays non renseigné',
    flag: '',
    date: review.createdAt.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    rating: review.ratingOverall,
    text: review.comment,
  }))
  const profilePlaces = placeCatalog
    .filter(place => place.isActive)
    .map(place => ({ emoji: place.emoji, nameAr: place.nameAr, nameFr: place.nameFr, desc: place.desc, category: place.category }))
  const realStats = [
    ratingAggregate._count.ratingOverall > 0 ? { value: String(ratingAggregate._count.ratingOverall), label: 'Avis vérifiés' } : null,
    guide.experienceYears !== null ? { value: `${guide.experienceYears} ans`, label: 'Expérience' } : null,
  ].filter(Boolean) as Array<{ value: string; label: string }>

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: guide.bio || undefined,
    url: `https://safaruma.com/guides/${slug}`,
    knowsLanguage: languages,
    ...(rating !== null ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, reviewCount: ratingAggregate._count.ratingOverall, bestRating: 5, worstRating: 1 } } : {}),
  }

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <Navbar />
    <section style={{ background: '#1A1209', padding: '8rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(201,168,76,.15), transparent 65%)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {account.image ? <div style={{ position: 'relative', width: 112, height: 112, margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #C9A84C' }}><Image src={account.image} alt={name} fill sizes="112px" unoptimized style={{ objectFit: 'cover' }} /></div> : <div style={{ width: 112, height: 112, margin: '0 auto 16px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#F0D897,#C9A84C)', color: '#1A1209', fontSize: 35, fontWeight: 800, border: '3px solid #C9A84C' }}>{initials}</div>}
        <h1 style={{ color: 'white', margin: '0 0 8px', fontSize: 'clamp(2rem,5vw,3rem)' }}>{name}</h1>
        {serviceCities.length > 0 && <div style={{ color: '#C9A84C', fontWeight: 800, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>{serviceCities.join(' · ')}</div>}
        {rating === null ? <div style={{ margin: '18px auto', color: '#F0D897', fontWeight: 700 }}>Nouveau guide — aucun avis pour le moment</div> : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, margin: '18px 0', color: 'white' }}><span style={{ color: '#C9A84C', letterSpacing: 2 }}>★★★★★</span><strong>{rating.toFixed(1)}</strong><span style={{ color: 'rgba(255,255,255,.55)' }}>({ratingAggregate._count.ratingOverall} avis)</span></div>}
        {guide.bio && <p style={{ color: 'rgba(255,255,255,.7)', maxWidth: 650, lineHeight: 1.8, margin: '18px auto' }}>{guide.bio}</p>}
        {realStats.length > 0 && <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', margin: '24px 0' }}>{realStats.map(stat => <div key={stat.label} style={{ minWidth: 130, padding: 15, borderRadius: 13, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(201,168,76,.25)' }}><div style={{ color: '#F0D897', fontSize: 24, fontWeight: 800 }}>{stat.value}</div><div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>{stat.label}</div></div>)}</div>}
        {languages.length > 0 && <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>{languages.map(language => <span key={language} style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.8)', fontSize: 12 }}>{language}</span>)}</div>}
      </div>
    </section>
    <div style={{ background: '#FAF7F0', minHeight: '70vh' }}>
      <GuideProfileClient
        slug={slug}
        guideName={name}
        isOfficial={false}
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
