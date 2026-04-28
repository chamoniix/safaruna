'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function CeQuiVousAttend() {
  const [flow, setFlow] = useState<'makkah' | 'madinah'>('makkah')
  const [openStep, setOpenStep] = useState<string | null>(null)
  const [openSplit, setOpenSplit] = useState<string | null>(null)

  const togStep = (id: string) => setOpenStep(prev => prev === id ? null : id)
  const togSplit = (id: string) => setOpenSplit(prev => prev === id ? null : id)
  const changeFlow = (f: 'makkah' | 'madinah') => {
    setFlow(f)
    setOpenStep(null)
    setOpenSplit(null)
  }

  return (
    <>
      <Navbar />
      <div style={{ background: '#FAF7F0', minHeight: '100vh', paddingTop: '5rem', paddingBottom: 0 }}>

        {/* HERO */}
        <div style={{
          background: '#1A1209', padding: '36px 20px 28px',
          borderRadius: '0 0 20px 20px', textAlign: 'center',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 500, letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 8,
          }}>SAFARUMA</div>
          <h1 style={{
            fontSize: 26, color: 'white', fontFamily: 'Georgia,serif',
            fontWeight: 400, margin: '0 0 10px',
          }}>
            Ce qui vous <em style={{ color: '#C9A84C' }}>attend</em>
          </h1>
          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.7,
            maxWidth: 340, margin: '0 auto 24px',
          }}>
            Vous avez votre billet d&apos;avion et votre hôtel.
            Il ne manque que la personne qui fera de ce voyage
            le plus beau moment de votre vie.
          </p>

          {/* 3 cartes contexte */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { icon: '✈', label: 'Billet déjà\nréservé' },
              { icon: '🏠', label: 'Hôtel déjà\nréservé' },
              { icon: '♡', label: 'Guide\nréservé ✓' },
            ].map(c => (
              <div key={c.label} style={{
                background: 'rgba(201,168,76,.1)',
                border: '.5px solid rgba(201,168,76,.25)',
                borderRadius: 10, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
                <div style={{
                  fontSize: 11, color: '#C9A84C', lineHeight: 1.4,
                  whiteSpace: 'pre-line',
                }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Ligne + label */}
          <div style={{
            height: 20, width: 1.5,
            background: 'rgba(201,168,76,.3)', margin: '0 auto',
          }} />
          <div style={{
            fontSize: 10, color: 'rgba(26,18,9,.45)', textAlign: 'center',
            letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8,
          }}>Votre parcours</div>

          {/* Sélecteur */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {([
              { id: 'makkah', title: 'Makkah uniquement', sub: 'Ihram dans l\'avion' },
              { id: 'madinah', title: 'Madinah + Makkah', sub: 'Miqat Dhul Hulaifa' },
            ] as const).map(c => (
              <div
                key={c.id}
                onClick={() => changeFlow(c.id)}
                style={{
                  background: flow === c.id ? 'rgba(201,168,76,.04)' : 'white',
                  border: flow === c.id ? '1.5px solid #C9A84C' : '.5px solid rgba(26,18,9,.15)',
                  borderRadius: 12, padding: '16px 12px',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all .2s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  margin: '0 auto 10px',
                  background: flow === c.id ? 'rgba(201,168,76,.12)' : 'transparent',
                  border: flow === c.id
                    ? '.5px solid rgba(201,168,76,.4)'
                    : '.5px solid rgba(26,18,9,.15)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 16,
                }}>
                  {c.id === 'makkah' ? '🕋' : '🕌'}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: '#1A1209', marginBottom: 3,
                }}>{c.title}</div>
                <div style={{ fontSize: 11, color: '#7A6D5A' }}>{c.sub}</div>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  margin: '10px auto 0',
                  background: flow === c.id ? '#C9A84C' : 'transparent',
                  border: flow === c.id
                    ? '1.5px solid #C9A84C'
                    : '1.5px solid rgba(26,18,9,.2)',
                  transition: 'all .2s',
                }} />
              </div>
            ))}
          </div>

          {/* FLOW */}
          {flow === 'makkah' ? (
            <FlowMakkah
              openStep={openStep} togStep={togStep}
              openSplit={openSplit} togSplit={togSplit}
            />
          ) : (
            <FlowMadinah
              openStep={openStep} togStep={togStep}
              openSplit={openSplit} togSplit={togSplit}
            />
          )}

        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center', padding: '2.5rem 1.25rem',
          background: '#FAF8F0', borderTop: '3px solid #C9A84C',
          marginTop: '1.5rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-cormorant, Georgia, serif)',
            fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
            fontWeight: 400, color: '#1A1209',
            marginBottom: '0.5rem',
          }}>
            Prêt à vivre cette expérience ?
          </p>
          <p style={{ fontSize: '0.87rem', color: '#7A6D5A', marginBottom: '1.5rem' }}>
            Trouvez le guide qui vous accompagnera à chaque étape.
          </p>
          <Link href="/guides" style={{
            display: 'inline-block', background: '#1A1209', color: '#F0D897',
            padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 700,
            fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.04em',
          }}>
            Trouver mon guide
          </Link>
        </div>

      </div>
      <Footer />
    </>
  )
}

/* ─────────────────────────────────────────────
   COMPOSANTS PARTAGÉS
───────────────────────────────────────────── */

function StepCard({
  id, num, lineType = 'solid', highlight = false,
  icon, title, emotion, open, onToggle, children,
}: {
  id: string; num: number; lineType?: 'solid' | 'dash' | 'end'
  highlight?: boolean; icon: string; title: string; emotion: string
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 4 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#1A1209', border: '1.5px solid #C9A84C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 500, color: '#C9A84C', flexShrink: 0,
        }}>{num}</div>
        {lineType !== 'end' && (
          <div style={{
            width: 1.5, flex: 1, minHeight: 16, marginTop: 2,
            background: lineType === 'dash'
              ? 'repeating-linear-gradient(to bottom,rgba(201,168,76,.3),rgba(201,168,76,.3) 4px,transparent 4px,transparent 8px)'
              : 'linear-gradient(to bottom,rgba(201,168,76,.4),rgba(201,168,76,.1))',
          }} />
        )}
      </div>
      <div
        onClick={onToggle}
        style={{
          flex: 1, marginBottom: 12, padding: '14px 16px',
          background: highlight ? 'rgba(201,168,76,.04)' : 'white',
          border: open
            ? '.5px solid rgba(201,168,76,.5)'
            : highlight
            ? '.5px solid rgba(201,168,76,.3)'
            : '.5px solid rgba(26,18,9,.1)',
          borderRadius: 12, cursor: 'pointer', transition: 'border-color .2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(250,247,240,1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1209' }}>{title}</div>
            <div style={{ fontSize: 11, color: 'rgba(201,168,76,.8)', fontStyle: 'italic', marginTop: 1 }}>{emotion}</div>
          </div>
          <span style={{
            fontSize: 11, color: 'rgba(26,18,9,.3)',
            transition: 'transform .2s',
            transform: open ? 'rotate(180deg)' : 'none',
            display: 'inline-block',
          }}>▼</span>
        </div>
        {open && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '.5px solid rgba(26,18,9,.08)' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

function GuideQuote({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: 'linear-gradient(135deg,#8B6914,#C9A84C)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 500, color: '#1A1209', flexShrink: 0,
      }}>NL</div>
      <div style={{
        fontSize: 11, color: '#7A6D5A', fontStyle: 'italic', lineHeight: 1.65,
        background: 'rgba(250,247,240,1)', borderRadius: 8,
        padding: '8px 10px', flex: 1,
      }}>{text}</div>
    </div>
  )
}

function InfoTag({ text, gold = false }: { text: string; gold?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 10,
      background: gold ? 'rgba(201,168,76,.08)' : 'rgba(250,247,240,1)',
      color: gold ? 'rgba(201,168,76,.9)' : 'rgba(26,18,9,.4)',
      border: gold ? '.5px solid rgba(201,168,76,.2)' : '.5px solid rgba(26,18,9,.1)',
      padding: '2px 8px', borderRadius: 6, marginTop: 8,
    }}>{text}</span>
  )
}

function Talbiya() {
  return (
    <div style={{
      background: '#1A1209', borderRadius: 8,
      padding: '10px 14px', marginTop: 10, textAlign: 'center',
    }}>
      <div style={{ fontSize: 14, color: '#C9A84C', fontFamily: 'Georgia,serif', marginBottom: 3 }}>
        لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>
        Labbayk Allahumma labbayk — la Talbiya commence
      </div>
    </div>
  )
}

function SplitRasage({
  openSplit, togSplit,
}: {
  openSplit: string | null
  togSplit: (id: string) => void
}) {
  return (
    <div style={{ flex: 1, marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
        {['Homme — Halq', 'Femme — Taqsir'].map(l => (
          <div key={l} style={{
            fontSize: 10, color: '#7A6D5A', textAlign: 'center',
            padding: '3px 0', background: 'rgba(250,247,240,1)', borderRadius: 6,
          }}>{l}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* Homme */}
        <div
          onClick={() => togSplit('homme')}
          style={{
            background: 'white', borderRadius: 12, padding: 12, cursor: 'pointer',
            border: openSplit === 'homme'
              ? '.5px solid rgba(201,168,76,.5)'
              : '.5px solid rgba(26,18,9,.1)',
            transition: 'border-color .2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1209' }}>Raser la tête</div>
              <div style={{ fontSize: 10, color: 'rgba(201,168,76,.8)', fontStyle: 'italic', marginTop: 1 }}>Sortie d&apos;ihram</div>
            </div>
            <span style={{
              fontSize: 10, color: 'rgba(26,18,9,.3)',
              transform: openSplit === 'homme' ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s', display: 'inline-block',
            }}>▼</span>
          </div>
          {openSplit === 'homme' && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '.5px solid rgba(26,18,9,.08)' }}>
              <div style={{ fontSize: 11, color: '#7A6D5A', lineHeight: 1.7 }}>
                Rasage complet de la tête — c&apos;est la sortie de l&apos;état d&apos;ihram pour les hommes.
                Votre guide vous accompagne chez un barbier du Haram.
                Ce moment marque la fin des rites de la Omra.
              </div>
              <GuideQuote text={`"Je vous accompagne chez le barbier. C'est un moment simple mais fort — vous sortez de l'ihram, votre Omra est accomplie."`} />
            </div>
          )}
        </div>
        {/* Femme */}
        <div
          onClick={() => togSplit('femme')}
          style={{
            background: 'white', borderRadius: 12, padding: 12, cursor: 'pointer',
            border: openSplit === 'femme'
              ? '.5px solid rgba(201,168,76,.5)'
              : '.5px solid rgba(26,18,9,.1)',
            transition: 'border-color .2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1209' }}>Couper quelques mèches</div>
              <div style={{ fontSize: 10, color: 'rgba(201,168,76,.8)', fontStyle: 'italic', marginTop: 1 }}>Sortie d&apos;ihram</div>
            </div>
            <span style={{
              fontSize: 10, color: 'rgba(26,18,9,.3)',
              transform: openSplit === 'femme' ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s', display: 'inline-block',
            }}>▼</span>
          </div>
          {openSplit === 'femme' && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '.5px solid rgba(26,18,9,.08)' }}>
              <div style={{ fontSize: 11, color: '#7A6D5A', lineHeight: 1.7 }}>
                Couper une petite longueur de cheveux (largeur d&apos;un doigt environ) suffit.
                Simple, discret, intime. Votre guide vous explique comment et vous laisse votre espace.
              </div>
              <GuideQuote text={`"Je vous explique le geste, et vous vous occupez du reste. C'est votre moment intime — votre Omra est accomplie."`} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConnectorLine() {
  return (
    <div style={{
      width: 1.5, height: 16,
      background: 'rgba(201,168,76,.2)', margin: '0 14px 8px',
    }} />
  )
}

function StepDesc({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: '#7A6D5A', lineHeight: 1.7 }}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────
   FLOW MAKKAH
───────────────────────────────────────────── */

function FlowMakkah({
  openStep, togStep, openSplit, togSplit,
}: {
  openStep: string | null; togStep: (id: string) => void
  openSplit: string | null; togSplit: (id: string) => void
}) {
  return (
    <>
      <StepCard id="m1" num={1} highlight icon="📱"
        title="Votre guide vous contacte"
        emotion="Dès confirmation — il prépare tout"
        open={openStep === 'm1'} onToggle={() => togStep('m1')}
      >
        <StepDesc>
          Dès votre réservation confirmée, votre guide vous contacte.
          Il vous envoie un guide pratique complet : comment mettre l&apos;ihram,
          comment reconnaître le miqat depuis l&apos;avion, et les du&apos;as à lire.
          Vous partez préparés.
        </StepDesc>
        <GuideQuote text={`"Je vous envoie tout avant votre départ. Quand vous montez à bord, vous savez exactement ce qui vous attend."`} />
        <InfoTag text="Contact sous 24h après réservation" gold />
      </StepCard>

      <StepCard id="m2" num={2} icon="✈️"
        title="Dans l'avion — miqat + ihram"
        emotion="L'Omra commence au-dessus des nuages"
        open={openStep === 'm2'} onToggle={() => togStep('m2')}
      >
        <StepDesc>
          Selon votre provenance, le miqat se passe dans l&apos;avion.
          Le commandant de bord annonce le survol de la zone sacrée —
          c&apos;est à ce moment que vous mettez votre ihram et posez votre intention.
          Votre guide vous a préparé à reconnaître et vivre ce moment.
        </StepDesc>
        <Talbiya />
      </StepCard>

      <StepCard id="m3" num={3} icon="🤝"
        title="Arrivée — votre guide vous attend"
        emotion="Sortie bagages, votre prénom sur une pancarte"
        open={openStep === 'm3'} onToggle={() => togStep('m3')}
      >
        <StepDesc>
          Votre guide vous attend à la sortie bagages.
          Il prend vos bagages, vous installe dans le véhicule,
          et vous conduit à l&apos;hôtel. Vous êtes déjà en ihram —
          l&apos;Omra va commencer très vite.
        </StepDesc>
        <InfoTag text="Pick-up aéroport — si sélectionné" />
      </StepCard>

      <StepCard id="m4" num={4} icon="🔄"
        title="Tawaf · Sa'i · Zamzam"
        emotion="7 tours · 7 passages · chaque geste compris"
        open={openStep === 'm4'} onToggle={() => togStep('m4')}
      >
        <StepDesc>
          Votre guide accompagne chaque pas, guide les du&apos;as, raconte l&apos;histoire
          de chaque lieu. Après le Sa&apos;i vous buvez l&apos;eau de Zamzam.
          Pour les personnes à mobilité réduite, fauteuils gratuits du Haram
          (dépôt passeport) ou aide-pousseur (SAR 100–300),
          coordonnés par votre guide.
        </StepDesc>
        <GuideQuote text={`"À chaque tour je vous raconte quelque chose. Vous vivez l'histoire — vous ne la regardez pas."`} />
      </StepCard>

      {/* Split rasage */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#1A1209', border: '1.5px solid #C9A84C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 500, color: '#C9A84C',
          }}>5</div>
        </div>
        <SplitRasage openSplit={openSplit} togSplit={togSplit} />
      </div>

      <ConnectorLine />

      <StepCard id="m6" num={6} icon="⛰️"
        title="Visites à Makkah"
        emotion="Selon les lieux choisis à la réservation"
        open={openStep === 'm6'} onToggle={() => togStep('m6')}
      >
        <StepDesc>
          Jabal Nour, Jabal Thawr, Arafat, Mina...
          En fonction des visites sélectionnées lors de votre réservation,
          votre guide vous accompagne sur chaque lieu et l&apos;anime avec son histoire
          réelle, adaptée à votre groupe.
        </StepDesc>
        <InfoTag text="En fonction de vos visites choisies" />
      </StepCard>

      <StepCard id="m7" num={7} lineType="end" highlight icon="✈️"
        title="Drop-off aéroport"
        emotion="Votre guide vous accompagne jusqu'au bout"
        open={openStep === 'm7'} onToggle={() => togStep('m7')}
      >
        <StepDesc>
          Votre guide vous raccompagne à l&apos;aéroport et reste avec vous
          jusqu&apos;à l&apos;embarquement. Vous repartez avec quelque chose
          que personne ne peut vous enlever.
        </StepDesc>
        <InfoTag text="Drop-off aéroport — si sélectionné" />
      </StepCard>
    </>
  )
}

/* ─────────────────────────────────────────────
   FLOW MADINAH
───────────────────────────────────────────── */

function FlowMadinah({
  openStep, togStep, openSplit, togSplit,
}: {
  openStep: string | null; togStep: (id: string) => void
  openSplit: string | null; togSplit: (id: string) => void
}) {
  return (
    <>
      <StepCard id="d1" num={1} highlight icon="📱"
        title="Votre guide vous contacte"
        emotion="Dès confirmation — il prépare tout"
        open={openStep === 'd1'} onToggle={() => togStep('d1')}
      >
        <StepDesc>
          Votre guide vous contacte dès la confirmation.
          Il vous explique le processus complet — arrivée à Madinah,
          les visites, le miqat de Dhul Hulaifa, et le voyage vers Makkah.
          Vous n&apos;avez qu&apos;à vous concentrer sur le spirituel.
        </StepDesc>
        <GuideQuote text={`"Je m'occupe de toute la logistique. Vous, vous vous concentrez sur ce qui compte vraiment."`} />
        <InfoTag text="Contact sous 24h après réservation" gold />
      </StepCard>

      <StepCard id="d2" num={2} icon="🤝"
        title="Arrivée à Madinah"
        emotion="Pas encore d'ihram — tenue normale"
        open={openStep === 'd2'} onToggle={() => togStep('d2')}
      >
        <StepDesc>
          Vous arrivez à Madinah en tenue normale —
          la Omra commence à Makkah. Votre guide vous attend,
          prend vos bagages et vous conduit à l&apos;hôtel.
        </StepDesc>
        <InfoTag text="Pick-up aéroport Madinah — si sélectionné" />
      </StepCard>

      <StepCard id="d3" num={3} icon="⛰️"
        title="Visites à Madinah"
        emotion="Selon les lieux choisis à la réservation"
        open={openStep === 'd3'} onToggle={() => togStep('d3')}
      >
        <StepDesc>
          Masjid An-Nabawi, La Rawdah, Masjid Quba, Badr, Uhud...
          En fonction des visites sélectionnées, votre guide vous accompagne
          sur chaque lieu avec son histoire réelle et émouvante.
        </StepDesc>
        <InfoTag text="En fonction de vos visites choisies" />
      </StepCard>

      <StepCard id="d4" num={4} lineType="dash" highlight icon="🛡️"
        title="Miqat — Dhul Hulaifa"
        emotion="L'intention · l'ihram · la Talbiya"
        open={openStep === 'd4'} onToggle={() => togStep('d4')}
      >
        <StepDesc>
          Avant de quitter Madinah pour Makkah, on s&apos;arrête au miqat
          de Dhul Hulaifa (Abyar Ali). C&apos;est ici que vous mettez votre ihram
          et posez l&apos;intention de la Omra. Votre guide guide chaque geste,
          chaque du&apos;a.
        </StepDesc>
        <Talbiya />
      </StepCard>

      <StepCard id="d5" num={5} lineType="dash" icon="🚗"
        title="Route vers Makkah"
        emotion="En ihram · en Talbiya · en préparation"
        open={openStep === 'd5'} onToggle={() => togStep('d5')}
      >
        <StepDesc>
          Le voyage de Madinah à Makkah se fait en ihram,
          en récitant la Talbiya. Votre guide prépare votre cœur —
          il vous parle du Tawaf, du Sa&apos;i.
          Quand vous apercevez le Haram pour la première fois, vous êtes prêts.
        </StepDesc>
      </StepCard>

      <StepCard id="d6" num={6} icon="🔄"
        title="Tawaf · Sa'i · Zamzam"
        emotion="7 tours · 7 passages · chaque geste compris"
        open={openStep === 'd6'} onToggle={() => togStep('d6')}
      >
        <StepDesc>
          Votre guide accompagne chaque pas, guide les du&apos;as, raconte l&apos;histoire.
          Pour les personnes à mobilité réduite, fauteuils gratuits du Haram
          (dépôt passeport) ou aide-pousseur (SAR 100–300) coordonnés
          par votre guide.
        </StepDesc>
        <GuideQuote text={`"À chaque tour je vous raconte quelque chose. Vous vivez l'histoire — vous ne la regardez pas."`} />
      </StepCard>

      {/* Split rasage */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#1A1209', border: '1.5px solid #C9A84C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 500, color: '#C9A84C',
          }}>7</div>
        </div>
        <SplitRasage openSplit={openSplit} togSplit={togSplit} />
      </div>

      <ConnectorLine />

      <StepCard id="d8" num={8} icon="⛰️"
        title="Visites à Makkah"
        emotion="Selon les lieux choisis à la réservation"
        open={openStep === 'd8'} onToggle={() => togStep('d8')}
      >
        <StepDesc>
          Jabal Nour, Jabal Thawr, Arafat, Mina...
          En fonction des visites sélectionnées, votre guide anime
          chaque lieu avec son histoire réelle.
        </StepDesc>
        <InfoTag text="En fonction de vos visites choisies" />
      </StepCard>

      <StepCard id="d9" num={9} lineType="dash" icon="↩️"
        title="Retour à Madinah"
        emotion="Si votre vol repart de Madinah"
        open={openStep === 'd9'} onToggle={() => togStep('d9')}
      >
        <StepDesc>
          Si votre vol retour part de Madinah, votre guide vous raccompagne.
          Un dernier moment au Masjid An-Nabawi si vous le souhaitez,
          puis direction l&apos;aéroport.
        </StepDesc>
        <InfoTag text="Selon votre itinéraire de retour" />
      </StepCard>

      <StepCard id="d10" num={10} lineType="end" highlight icon="✈️"
        title="Drop-off aéroport"
        emotion="Jusqu'à l'embarquement"
        open={openStep === 'd10'} onToggle={() => togStep('d10')}
      >
        <StepDesc>
          Votre guide vous accompagne jusqu&apos;à l&apos;embarquement.
          Vous repartez avec une Omra accomplie, comprise,
          et des souvenirs pour toute une vie.
        </StepDesc>
        <InfoTag text="Drop-off aéroport — si sélectionné" />
      </StepCard>
    </>
  )
}
