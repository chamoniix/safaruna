'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

function generateRefCode(name: string, userId: string): string {
  const clean = (name || 'AMI').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
  // Utiliser l'ID unique du user pour garantir l'unicité
  const idHash = Math.abs(
    Array.from(userId || '').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0) % 9999
  ).toString().padStart(4, '0');
  return `${clean}-${idHash}`;
}

const STEPS = [
  { num: '1', icon: '🔗', title: 'Partagez votre lien', desc: 'Envoyez votre lien unique à vos proches via WhatsApp, Instagram ou email.' },
  { num: '2', icon: '🕋', title: 'Ils réservent', desc: 'Votre filleul bénéficie automatiquement de 80€ de réduction sur sa première réservation.' },
  { num: '3', icon: '💰', title: 'Vous gagnez 80€', desc: 'Dès que son paiement est confirmé, 80€ de crédit sont ajoutés à votre compte.' },
];

const FAKE_HISTORY = [
  { name: 'Yasmine B.', date: 'Il y a 3 jours', status: 'En attente', amount: 80, color: '#8B6914', bg: '#FAF3E0' },
  { name: 'Omar K.',    date: 'Il y a 2 semaines', status: 'Confirmé',  amount: 80, color: '#1D5C3A', bg: '#E8F5EE' },
];

export default function ParrainagePage() {
  const { data: session } = useSession();
  const firstName = (session?.user as any)?.firstName || session?.user?.name?.split(' ')[0] || 'MON';
  const userId = (session?.user as any)?.id || session?.user?.email || 'default';
  const refCode = generateRefCode(firstName, userId);
  const refUrl = `https://safaruma.com/rejoindre?ref=${refCode}`;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(refUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🕋 Je voyage avec SAFARUMA — des guides privés certifiés pour découvrir l'Arabie Saoudite. Utilise mon lien et bénéficie de 80€ de réduction sur ta première réservation !\n\n👉 ${refUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent('80€ offerts sur SAFARUMA — mon lien de parrainage');
    const body = encodeURIComponent(`Salut,\n\nJe voulais te partager SAFARUMA, une plateforme pour réserver des guides privés certifiés en Arabie Saoudite.\n\nAvec mon lien, tu bénéficies de 80€ de réduction sur ta première réservation :\n${refUrl}\n\nBonne découverte !`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ref-url-box { transition: border-color 0.15s; }
        .ref-url-box:hover { border-color: #C9A84C !important; }
        .copy-btn { transition: background 0.15s, color 0.15s; }
        .copy-btn:hover { background: #2D1F08 !important; }
        .share-btn { transition: border-color 0.15s, background 0.15s; }
        .share-btn:hover { border-color: #C9A84C !important; background: #FAF3E0 !important; }
        @media (max-width: 640px) {
          .parr-hero { flex-direction: column !important; gap: 1rem !important; }
          .parr-steps { grid-template-columns: 1fr !important; }
          .parr-credits { flex-direction: column !important; gap: 0.75rem !important; }
        }
      `}} />

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 600, color: '#1A1209', marginBottom: '0.25rem' }}>
          Parrainage
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#7A6D5A' }}>
          Invitez vos proches à découvrir l&apos;Arabie Saoudite — et gagnez ensemble.
        </p>
      </div>

      {/* Hero card */}
      <div style={{ background: 'linear-gradient(135deg, #1A1209 0%, #2D1F08 100%)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 80% at 90% 50%, rgba(201,168,76,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'serif', fontSize: '8rem', color: 'rgba(201,168,76,0.05)', lineHeight: 1, userSelect: 'none' }}>هدية</div>

        <div className="parr-hero" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Programme de parrainage</div>
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'white', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.2 }}>
              Parrainez un ami,<br />gagnez <span style={{ color: '#C9A84C' }}>80€</span> chacun
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 400 }}>
              Chaque ami qui réserve avec votre lien reçoit 80€ de réduction. Et vous gagnez 80€ de crédit dès sa première réservation confirmée.
            </p>
          </div>

          {/* Credits display */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 16, padding: '1.25rem 1.75rem' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,216,151,0.5)', marginBottom: '0.4rem' }}>Mes crédits</div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 700, color: '#F0D897', lineHeight: 1 }}>80€</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>1 parrainage confirmé</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mon lien */}
      <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7A6D5A', marginBottom: '1rem' }}>Mon lien de parrainage</div>

        {/* URL display */}
        <div className="ref-url-box" style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1.5px solid #EDE8DC', borderRadius: 12, overflow: 'hidden', marginBottom: '0.875rem' }}>
          <div style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#1A1209', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: '#FAF7F0' }}>
            safaruma.com/rejoindre?ref=<span style={{ color: '#C9A84C', fontWeight: 800 }}>{refCode}</span>
          </div>
          <button
            className="copy-btn"
            onClick={handleCopy}
            style={{ padding: '0.75rem 1.25rem', background: copied ? '#1D5C3A' : '#1A1209', color: copied ? 'white' : '#F0D897', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 0.2s' }}
          >
            {copied ? '✓ Copié !' : 'Copier'}
          </button>
        </div>

        {/* Share buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={shareWhatsApp} className="share-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', border: '1.5px solid #EDE8DC', borderRadius: 50, background: 'white', fontSize: '0.78rem', fontWeight: 600, color: '#1A1209', cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          <button onClick={shareEmail} className="share-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', border: '1.5px solid #EDE8DC', borderRadius: 50, background: 'white', fontSize: '0.78rem', fontWeight: 600, color: '#1A1209', cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1209" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email
          </button>
          <button onClick={() => { if (navigator.share) { navigator.share({ title: 'SAFARUMA — 80€ offerts', text: "Découvrez l'Arabie Saoudite avec un guide privé certifié et bénéficiez de 80€ de réduction !", url: refUrl }); } else { handleCopy(); } }} className="share-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', border: '1.5px solid #EDE8DC', borderRadius: 50, background: 'white', fontSize: '0.78rem', fontWeight: 600, color: '#1A1209', cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1209" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Partager
          </button>
        </div>
      </div>

      {/* Comment ça marche */}
      <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7A6D5A', marginBottom: '1rem' }}>Comment ça marche</div>
        <div className="parr-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FAF3E0', border: '2px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1.25rem' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.3rem' }}>{s.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.55 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crédits & historique */}
      <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7A6D5A', marginBottom: '1rem' }}>Mes parrainages</div>

        {/* Stats */}
        <div className="parr-credits" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Invités', value: '2', color: '#1A1209' },
            { label: 'Confirmés', value: '1', color: '#1D5C3A' },
            { label: 'En attente', value: '1', color: '#8B6914' },
            { label: 'Crédits gagnés', value: '80€', color: '#C9A84C' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#FAF7F0', borderRadius: 12, padding: '0.875rem', border: '1px solid #EDE8DC', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: '#7A6D5A', marginTop: '0.2rem', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Historique */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FAKE_HISTORY.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.875rem', background: '#FAF7F0', borderRadius: 10, border: '1px solid #EDE8DC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #E8DFC8, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#1A1209' }}>
                  {h.name.split(' ')[0][0]}{h.name.split(' ')[1]?.[0] || ''}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209' }}>{h.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>{h.date}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ background: h.bg, color: h.color, fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 50 }}>{h.status}</span>
                <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: h.color }}>+{h.amount}€</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conditions */}
      <div style={{ background: '#FAF7F0', border: '1px solid #EDE8DC', borderRadius: 12, padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6D5A', marginBottom: '0.5rem' }}>Conditions du programme</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {[
            '80€ de crédit offerts au parrain dès la première réservation confirmée du filleul',
            '80€ de réduction automatique pour le filleul sur sa première réservation',
            'Le crédit parrain est valable 12 mois et utilisable sur toute réservation SAFARUMA',
            'Un parrainage = une réservation complétée et payée par le filleul',
            'SAFARUMA se réserve le droit de modifier les conditions du programme',
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.5 }}>
              <span style={{ color: '#C9A84C', flexShrink: 0, fontWeight: 700 }}>·</span>
              {c}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
