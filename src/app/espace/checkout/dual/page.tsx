'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

const GUIDES_DATA: Record<string, { name: string; initials: string; title: string; location: string; rating: number; reviews: number; price: number; gradient: string; avatarGradient: string; isOfficial?: boolean }> = {
  'naim-laamari':      { name: 'Naïm LAAMARI',      initials: 'NL', title: 'Guide Officiel SAFARUMA', location: 'Makkah · Madinah', rating: 5.0,  reviews: 5822, price: 150, gradient: 'linear-gradient(135deg, #1A1209, #2D1F08)', avatarGradient: 'linear-gradient(135deg, #F0D897, #C9A84C)', isOfficial: true },
  'rachid-al-madani':  { name: 'Rachid Al-Madani',  initials: 'RA', title: 'Cheikh · Spécialiste Sîra', location: 'Makkah · Madinah', rating: 4.97, reviews: 214,  price: 280, gradient: 'linear-gradient(135deg, #2D1F08, #1A1209)', avatarGradient: 'linear-gradient(135deg, #F0D897, #C9A84C)' },
  'fatima-al-omari':   { name: 'Fatima Al-Omari',   initials: 'FA', title: 'Guide femme · Familles',   location: 'Makkah',          rating: 4.95, reviews: 178,  price: 320, gradient: 'linear-gradient(135deg, #082818, #1D5C3A)', avatarGradient: 'linear-gradient(135deg, #9FE1CB, #1D9E75)' },
  'youssouf-konate':   { name: 'Youssouf Konaté',   initials: 'YK', title: "Spécialiste Afrique de l'Ouest", location: 'Makkah', rating: 4.92, reviews: 94,   price: 240, gradient: 'linear-gradient(135deg, #1A2810, #2D4A1A)', avatarGradient: 'linear-gradient(135deg, #D4E8A0, #5A8A20)' },
  'abdullah-ben-yusuf':{ name: 'Abdullah Ben Yusuf', initials: 'AB', title: 'Diplômé · Université de Madinah', location: 'Madinah', rating: 4.98, reviews: 147, price: 300, gradient: 'linear-gradient(135deg, #0A1830, #1A4A8A)', avatarGradient: 'linear-gradient(135deg, #A0C4F0, #1A6AC9)' },
  'samira-al-rashidi': { name: 'Samira Al-Rashidi', initials: 'SR', title: 'Spécialiste PMR · Madinah',  location: 'Madinah',        rating: 4.93, reviews: 76,   price: 380, gradient: 'linear-gradient(135deg, #28081A, #7A2D8A)', avatarGradient: 'linear-gradient(135deg, #F0A8C0, #A81D5C)' },
};

const TRANSPORT_LABELS: Record<string, string> = {
  train:     'Train Haramain',
  taxi:      'Taxi privé',
  guide_car: 'Voiture du guide',
};

function GuideAvatar({ slug, size = 44 }: { slug: string; size?: number }) {
  const g = GUIDES_DATA[slug];
  if (!g) return null;
  if (slug === 'naim-laamari') {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <Image src="/guide-avatar.png" alt={g.name} fill style={{ objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: g.avatarGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: '#1A1209', fontSize: size * 0.32, flexShrink: 0 }}>
      {g.initials}
    </div>
  );
}

function GuideRecapCard({ slug, city, cityColor, cityBg }: { slug: string; city: string; cityColor: string; cityBg: string }) {
  const g = GUIDES_DATA[slug];
  if (!g) return null;
  return (
    <div style={{ background: cityBg, border: `1px solid ${cityColor}30`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ height: 56, background: g.gradient, position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: -16, left: 12 }}>
          <GuideAvatar slug={slug} size={36} />
        </div>
      </div>
      <div style={{ padding: '1.25rem 0.875rem 0.875rem' }}>
        <div style={{ fontSize: '0.58rem', fontWeight: 800, color: cityColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>Guide {city}</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>{g.name}</div>
        <div style={{ fontSize: '0.68rem', color: '#7A6D5A', fontStyle: 'italic', marginBottom: '0.4rem' }}>{g.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#C9A84C', fontWeight: 700 }}>★ {g.rating}</span>
          <span style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>({g.reviews} avis)</span>
        </div>
      </div>
    </div>
  );
}

function CheckoutDualContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const slugMadinah  = searchParams.get('guide_madinah') || '';
  const slugMakkah   = searchParams.get('guide_makkah') || '';
  const personnesRaw = parseInt(searchParams.get('personnes') || '2');
  const personnes    = isNaN(personnesRaw) || personnesRaw < 1 ? 2 : Math.min(personnesRaw, 50);
  const transport    = searchParams.get('transport') || 'train';
  const arrivee      = searchParams.get('arrivee') || '';
  const depart       = searchParams.get('depart') || '';

  const guideMadinah = GUIDES_DATA[slugMadinah];
  const guideMakkah  = GUIDES_DATA[slugMakkah];

  const sessionUser = session?.user as any;
  const [firstName, setFirstName] = useState(sessionUser?.firstName || sessionUser?.name?.split(' ')[0] || '');
  const [lastName, setLastName]   = useState(sessionUser?.lastName || sessionUser?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail]         = useState(sessionUser?.email || '');
  const [whatsapp, setWhatsapp]   = useState('');
  const [notes, setNotes]         = useState('');
  const [ihram, setIhram]         = useState(false);
  const [ceinture, setCeinture]   = useState(false);

  const transportCost = transport === 'train' ? personnes * 80 * 2 : transport === 'taxi' ? Math.ceil(personnes / 4) * 120 * 2 : 0;
  const guideMadinahTotal = (guideMadinah?.price || 0) * personnes;
  const guideMakkahTotal  = (guideMakkah?.price  || 0) * personnes;
  const ihramCost    = ihram    ? personnes * 35 : 0;
  const ceintureCost = ceinture ? personnes * 12 : 0;
  const subtotal     = guideMadinahTotal + guideMakkahTotal + transportCost + ihramCost + ceintureCost;
  const total        = subtotal;

  const formatDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!guideMadinah || !guideMakkah) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', color: '#1A1209' }}>Guides non trouvés</div>
        <Link href="/guides/tunnel" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.85rem' }}>← Recommencer la sélection</Link>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .co-input {
          width: 100%; padding: 0.65rem 0.875rem; border: 1.5px solid #EDE8DC;
          border-radius: 10px; font-size: 0.875rem; color: #1A1209;
          background: #FDFBF7; font-family: inherit; outline: none;
          transition: border-color 0.15s; box-sizing: border-box;
        }
        .co-input:focus { border-color: #C9A84C; }
        .co-input::placeholder { color: rgba(122,109,90,0.45); }
        .co-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #7A6D5A; margin-bottom: 0.35rem; display: block; }
        .co-addon { transition: border-color 0.15s, background 0.15s; cursor: pointer; }
        .co-addon:hover { border-color: #C9A84C !important; }
        .co-addon.checked { border-color: #C9A84C !important; background: #FAF3E0 !important; }
        .co-submit { transition: background 0.15s, transform 0.1s; }
        .co-submit:hover { background: #2D1F08 !important; transform: translateY(-1px); }
        @media (max-width: 900px) {
          .co-layout { flex-direction: column !important; }
          .co-sidebar { position: static !important; width: 100% !important; }
        }
        @media (max-width: 480px) {
          .co-name-grid { grid-template-columns: 1fr !important; }
          .co-guides-grid { grid-template-columns: 1fr !important; }
        }
      `}} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.75rem', color: '#7A6D5A' }}>
          <Link href="/guides" style={{ color: '#7A6D5A', textDecoration: 'none' }}>Guides</Link>
          <span>›</span>
          <Link href="/guides/tunnel" style={{ color: '#7A6D5A', textDecoration: 'none' }}>Sélection</Link>
          <span>›</span>
          <span style={{ color: '#1A1209', fontWeight: 600 }}>Confirmation</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 600, color: '#1A1209', marginBottom: '0.4rem' }}>
          Confirmez et payez
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#7A6D5A', marginBottom: '2rem' }}>
          Vérifiez votre sélection et complétez votre réservation.
        </p>

        <div className="co-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* ── LEFT — Form ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Récap 2 guides */}
            <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7A6D5A', marginBottom: '0.875rem' }}>Vos guides sélectionnés</div>
              <div className="co-guides-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <GuideRecapCard slug={slugMadinah} city="Madinah" cityColor="#1D5C3A" cityBg="#F0FAF5" />
                <GuideRecapCard slug={slugMakkah}  city="Makkah"  cityColor="#8B6914" cityBg="#FAF8F0" />
              </div>
              <div style={{ marginTop: '0.875rem', padding: '0.65rem 0.875rem', background: '#F5F0E8', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>{transport === 'train' ? '🚄' : transport === 'taxi' ? '🚕' : '🚗'}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1A1209' }}>Transport : {TRANSPORT_LABELS[transport]}</div>
                  <div style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>Madinah → Makkah · {personnes} personne{personnes > 1 ? 's' : ''}</div>
                </div>
                <Link href="/guides/tunnel" style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#C9A84C', fontWeight: 600, textDecoration: 'none' }}>Modifier</Link>
              </div>
            </div>

            {/* Vos infos */}
            <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7A6D5A', marginBottom: '1rem' }}>Vos informations</div>
              <div className="co-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="co-label">Prénom</label>
                  <input className="co-input" placeholder="Karim" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="co-label">Nom</label>
                  <input className="co-input" placeholder="Lamrani" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="co-label">Email</label>
                <input className="co-input" type="email" placeholder="karim@exemple.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="co-label">WhatsApp</label>
                <input className="co-input" placeholder="+33 6 12 34 56 78" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
              </div>
              <div>
                <label className="co-label">Notes pour les guides (optionnel)</label>
                <textarea className="co-input" placeholder="Besoins spécifiques, personnes PMR, enfants en bas âge..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: 'none' }} />
              </div>
            </div>

            {/* Options additionnelles */}
            <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7A6D5A', marginBottom: '0.25rem' }}>Options additionnelles</div>
              <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginBottom: '1rem' }}>Votre guide vous apportera ces articles directement à l&apos;hôtel à Makkah.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div className={`co-addon${ihram ? ' checked' : ''}`} onClick={() => setIhram(i => !i)} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', border: '1.5px solid #EDE8DC', borderRadius: 12, background: 'white' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${ihram ? '#C9A84C' : '#EDE8DC'}`, background: ihram ? '#C9A84C' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {ihram && <span style={{ color: '#1A1209', fontSize: '0.7rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '1.25rem' }}>🕋</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>Tenue d&apos;Ihram (2 pièces blanches)</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A' }}>Coton certifié · Livré à l&apos;hôtel par votre guide</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>+{35 * personnes}€</div>
                    <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>35€/pers</div>
                  </div>
                </div>

                <div className={`co-addon${ceinture ? ' checked' : ''}`} onClick={() => setCeinture(c => !c)} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', border: '1.5px solid #EDE8DC', borderRadius: 12, background: 'white' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${ceinture ? '#C9A84C' : '#EDE8DC'}`, background: ceinture ? '#C9A84C' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {ceinture && <span style={{ color: '#1A1209', fontSize: '0.7rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '1.25rem' }}>👜</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>Ceinture / Sacoche sécurisée</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A' }}>Garder téléphone et argent sous l&apos;Ihram</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>+{12 * personnes}€</div>
                    <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>12€/pers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7A6D5A', marginBottom: '1rem' }}>Paiement sécurisé</div>
              <div style={{ padding: '1.5rem', background: '#F5F0E8', borderRadius: 12, textAlign: 'center', border: '1.5px dashed #E8DFC8' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.25rem' }}>Paiement bientôt disponible</div>
                <div style={{ fontSize: '0.75rem', color: '#7A6D5A', lineHeight: 1.6 }}>Notre système de paiement sécurisé sera disponible très prochainement. Votre réservation sera confirmée par WhatsApp sous 2h.</div>
              </div>
            </div>

          </div>

          {/* ── RIGHT — Sidebar récap ── */}
          <div className="co-sidebar" style={{ width: 340, flexShrink: 0, position: 'sticky', top: 100 }}>
            <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(26,18,9,0.06)' }}>

              {/* Header sidebar */}
              <div style={{ background: '#1A1209', padding: '1.25rem', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,216,151,0.5)', marginBottom: '0.3rem' }}>Récapitulatif</div>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', color: 'white', fontWeight: 600 }}>Voyage Madinah + Makkah</div>
                {(arrivee || depart) && (
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem' }}>
                    {formatDate(arrivee)} → {formatDate(depart)}
                  </div>
                )}
              </div>

              <div style={{ padding: '1.25rem' }}>
                {/* Lignes détail */}
                {[
                  { label: `Guide Madinah (${guideMadinah.name.split(' ')[0]}) × ${personnes}`, value: guideMadinahTotal },
                  { label: `Guide Makkah (${guideMakkah.name.split(' ')[0]}) × ${personnes}`, value: guideMakkahTotal },
                  { label: `Transport (${TRANSPORT_LABELS[transport]})`, value: transportCost },
                  ...(ihram ? [{ label: `Ihram × ${personnes}`, value: ihramCost }] : []),
                  ...(ceinture ? [{ label: `Ceinture × ${personnes}`, value: ceintureCost }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #F5F0E8', fontSize: '0.82rem' }}>
                    <span style={{ color: '#7A6D5A' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: '#1A1209' }}>{row.value > 0 ? `${row.value}€` : 'Inclus'}</span>
                  </div>
                ))}

                {/* Total */}
                <div style={{ marginTop: '1rem', padding: '0.875rem', background: '#FAF3E0', borderRadius: 10, border: '1px solid rgba(201,168,76,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A6D5A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: '#1A1209' }}>{total.toLocaleString('fr-FR')}€</span>
                </div>

                <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#7A6D5A', textAlign: 'center' }}>{personnes} personne{personnes > 1 ? 's' : ''} · Commission SAFARUMA incluse</div>

                {/* CTA */}
                <button className="co-submit" style={{ width: '100%', marginTop: '1rem', padding: '0.9rem', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em' }}>
                  Confirmer la réservation →
                </button>

                {/* Trust */}
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {['✓ Annulation gratuite sous 48h', '🛡️ Paiement 100% sécurisé', '⏱ Réponse guide sous 2h'].map(t => (
                    <div key={t} style={{ fontSize: '0.72rem', color: '#7A6D5A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default function CheckoutDualPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 58, minHeight: '100vh', background: '#FAF7F0', fontFamily: 'var(--font-manrope, sans-serif)' }}>
        <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: '#7A6D5A' }}>Chargement...</div>}>
          <CheckoutDualContent />
        </Suspense>
      </div>
    </>
  );
}
