'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// ── Thèmes de couleur par flow ─────────────────
type Theme = {
  accent: string
  circleColor: string
  bg: string
  borderActive: string
  borderHighlight: string
  line: string
  dash: string
  selectorBg: string
  selectorBorder: string
  selectorDot: string
  selectorIconBg: string
  selectorIconBorder: string
}

const MAKKAH: Theme = {
  accent: '#C9A84C',
  circleColor: '#C9A84C',
  bg: 'rgba(201,168,76,.04)',
  borderActive: 'rgba(201,168,76,.5)',
  borderHighlight: 'rgba(201,168,76,.3)',
  line: 'linear-gradient(to bottom,rgba(201,168,76,.4),rgba(201,168,76,.1))',
  dash: 'repeating-linear-gradient(to bottom,rgba(201,168,76,.3),rgba(201,168,76,.3) 4px,transparent 4px,transparent 8px)',
  selectorBg: 'rgba(250,243,224,.6)',
  selectorBorder: '1.5px solid #C9A84C',
  selectorDot: '#C9A84C',
  selectorIconBg: 'rgba(201,168,76,.12)',
  selectorIconBorder: '.5px solid rgba(201,168,76,.4)',
}

const MADINAH: Theme = {
  accent: '#1D5C3A',
  circleColor: '#4caf7d',
  bg: 'rgba(29,92,58,.04)',
  borderActive: 'rgba(29,92,58,.5)',
  borderHighlight: 'rgba(29,92,58,.22)',
  line: 'linear-gradient(to bottom,rgba(29,92,58,.4),rgba(29,92,58,.08))',
  dash: 'repeating-linear-gradient(to bottom,rgba(29,92,58,.3),rgba(29,92,58,.3) 4px,transparent 4px,transparent 8px)',
  selectorBg: 'rgba(232,245,238,.7)',
  selectorBorder: '1.5px solid #1D5C3A',
  selectorDot: '#1D5C3A',
  selectorIconBg: 'rgba(29,92,58,.1)',
  selectorIconBorder: '.5px solid rgba(29,92,58,.35)',
}

// ── SVG Icons ─────────────────────────────────
const IconPhone = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.74 3.36 2 2 0 0 1 3.73 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const IconPlane = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>
)

const IconKaaba = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="16" height="13" rx="1"/>
    <polyline points="4,9 12,5 20,9"/>
    <line x1="4" y1="14" x2="20" y2="14"/>
    <rect x="9.5" y="16" width="5" height="6"/>
  </svg>
)

const IconPlaneLand = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22h20M6.3 15.7l-1.1-3.8L2 10l2-2 3 3 4-1 4-5h2l1 2-8 7-3 1.7z"/>
  </svg>
)

const IconHandshake = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const IconCircle = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <polyline points="23 20 23 14 17 14"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
  </svg>
)

const IconMountain = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20h18L13 4z"/>
    <path d="M3 20l5-8 3 4 2-3 4 7"/>
  </svg>
)

const IconShield = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const IconCar = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

const IconReturn = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
  </svg>
)

// ── Main Component ─────────────────────────────
export default function CeQuiVousAttend() {
  const [flow, setFlow] = useState<'makkah' | 'madinah'>('makkah')
  const [openStep, setOpenStep] = useState<string | null>(null)
  const [openSplitM, setOpenSplitM] = useState<string | null>(null)
  const [openSplitD, setOpenSplitD] = useState<string | null>(null)

  const togStep = (id: string) => setOpenStep(prev => prev === id ? null : id)
  const changeFlow = (f: 'makkah' | 'madinah') => {
    setFlow(f)
    setOpenStep(null)
    setOpenSplitM(null)
    setOpenSplitD(null)
  }

  const theme = flow === 'makkah' ? MAKKAH : MADINAH

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://safaruma.com' },
      { '@type': 'ListItem', position: 2, name: 'Omra avec guide privé', item: 'https://safaruma.com/omra-avec-guide-prive' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Navbar />
      <div style={{ background: '#FAF7F0', minHeight: '100vh', paddingTop: 0, paddingBottom: 0 }}>

        {/* HERO — flush sous la navbar (paddingTop interne absorbe la hauteur navbar) */}
        <div style={{
          background: '#1A1209',
          padding: '130px 20px 28px',
          borderRadius: 0,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 500, letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 8,
          }}>SAFARUMA</div>
          <h1 style={{
            fontSize: 26, color: 'white', fontFamily: 'var(--font-cormorant, Georgia, serif)',
            fontWeight: 400, margin: '0 0 10px',
          }}>
            Ce qui vous <em style={{ color: '#C9A84C' }}>attend</em>
          </h1>
          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,.82)', lineHeight: 1.7,
            maxWidth: 340, margin: '0 auto 24px',
          }}>
            Vous avez votre billet d&apos;avion et votre hôtel.
            Il ne manque que la personne qui fera de ce voyage
            le plus beau moment de votre vie.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { icon: <IconPlane color="#C9A84C" />, label: 'Billet déjà\nréservé' },
              { icon: <IconHandshake color="#C9A84C" />, label: 'Hôtel déjà\nréservé' },
              { icon: <IconShield color="#C9A84C" />, label: 'Guide\nréservé ✓' },
            ].map((c, i) => (
              <div key={i} style={{
                background: 'rgba(201,168,76,.1)',
                border: '.5px solid rgba(201,168,76,.25)',
                borderRadius: 10, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{c.icon}</div>
                <div style={{ fontSize: 11, color: '#C9A84C', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Ligne + label */}
          <div style={{ height: 20, width: 1.5, background: `${theme.accent}55`, margin: '0 auto' }} />
          <div style={{
            fontSize: 10, color: 'rgba(26,18,9,.45)', textAlign: 'center',
            letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8,
          }}>Votre parcours</div>

          {/* Sélecteur */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {([
              { id: 'makkah', title: 'Makkah', sub: 'Ihram dans l\'avion', t: MAKKAH },
              { id: 'madinah', title: 'Madinah + Makkah', sub: 'Miqat Dhul Hulaifa', t: MADINAH },
            ] as const).map(c => {
              const active = flow === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => changeFlow(c.id)}
                  style={{
                    background: active ? c.t.selectorBg : 'white',
                    border: active ? c.t.selectorBorder : '.5px solid rgba(26,18,9,.15)',
                    borderRadius: 12, padding: '12px 10px',
                    cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    margin: '0 auto 8px',
                    background: active ? c.t.selectorIconBg : 'transparent',
                    border: active ? c.t.selectorIconBorder : '.5px solid rgba(26,18,9,.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {c.id === 'makkah'
                      ? <span style={{ fontSize: 16 }}>🕋</span>
                      : <IconShield color={active ? MADINAH.accent : '#7A6D5A'} />
                    }
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1209', marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: '#7A6D5A' }}>{c.sub}</div>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', margin: '8px auto 0',
                    background: active ? c.t.selectorDot : 'transparent',
                    border: active ? `1.5px solid ${c.t.selectorDot}` : '1.5px solid rgba(26,18,9,.2)',
                    transition: 'all .2s',
                  }} />
                </div>
              )
            })}
          </div>

          {flow === 'makkah' ? (
            <FlowMakkah
              openStep={openStep} togStep={togStep}
              openSplit={openSplitM} togSplit={id => setOpenSplitM(p => p === id ? null : id)}
              theme={MAKKAH}
            />
          ) : (
            <FlowMadinah
              openStep={openStep} togStep={togStep}
              openSplit={openSplitD} togSplit={id => setOpenSplitD(p => p === id ? null : id)}
              theme={MADINAH}
            />
          )}

        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center', padding: '2.5rem 1.25rem',
          background: '#FAF8F0', borderTop: `3px solid ${theme.accent}`,
          marginTop: '1.5rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-cormorant, Georgia, serif)',
            fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
            fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem',
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

// ── Composants partagés ────────────────────────

function StepCard({
  num, lineType = 'solid', highlight = false,
  icon, title, emotion, always, open, onToggle, children, theme,
}: {
  num: number; lineType?: 'solid' | 'dash' | 'end'
  highlight?: boolean; icon: React.ReactNode; title: string; emotion: string
  always?: React.ReactNode
  open: boolean; onToggle: () => void; children?: React.ReactNode
  theme: Theme
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 4 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#1A1209', border: `1.5px solid ${theme.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 600, color: theme.circleColor, flexShrink: 0,
        }}>{num}</div>
        {lineType !== 'end' && (
          <div style={{
            width: 1.5, flex: 1, minHeight: 16, marginTop: 2,
            background: lineType === 'dash' ? theme.dash : theme.line,
          }} />
        )}
      </div>
      <div
        onClick={onToggle}
        style={{
          flex: 1, marginBottom: 12, padding: '12px 14px',
          background: highlight ? theme.bg : 'white',
          border: open ? `.5px solid ${theme.borderActive}` : highlight ? `.5px solid ${theme.borderHighlight}` : '.5px solid rgba(26,18,9,.1)',
          borderRadius: 12, cursor: 'pointer', transition: 'border-color .2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(250,247,240,1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1209' }}>{title}</div>
            <div style={{ fontSize: 11, color: theme.accent, fontStyle: 'italic', marginTop: 1 }}>{emotion}</div>
          </div>
          <span style={{
            fontSize: 10, color: 'rgba(26,18,9,.3)',
            transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none',
            display: 'inline-block',
          }}>▼</span>
        </div>
        {always && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '.5px solid rgba(26,18,9,.06)' }}>
            {always}
          </div>
        )}
        {open && children && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '.5px solid rgba(26,18,9,.06)' }}>
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
        width: 22, height: 22, borderRadius: '50%',
        background: 'linear-gradient(135deg,#8B6914,#C9A84C)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 600, color: '#1A1209', flexShrink: 0,
      }}>NL</div>
      <div style={{
        fontSize: 11, color: '#7A6D5A', fontStyle: 'italic', lineHeight: 1.65,
        background: 'rgba(250,247,240,1)', borderRadius: 8,
        padding: '7px 10px', flex: 1,
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

function Talbiya({ theme }: { theme: Theme }) {
  return (
    <div style={{
      background: '#1A1209', borderRadius: 8,
      padding: '10px 14px', marginTop: 10, textAlign: 'center',
    }}>
      <div style={{ fontSize: 14, color: theme.accent, fontFamily: 'Georgia,serif', marginBottom: 3 }}>
        لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>
        Labbayk Allahumma labbayk — la Talbiya commence
      </div>
    </div>
  )
}

function SplitRasage({ openSplit, togSplit, theme }: { openSplit: string | null; togSplit: (id: string) => void; theme: Theme }) {
  return (
    <div style={{ flex: 1, marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
        {['Homme — Halq', 'Femme — Taqsir'].map(l => (
          <div key={l} style={{ fontSize: 10, color: '#7A6D5A', textAlign: 'center', padding: '3px 0', background: 'rgba(250,247,240,1)', borderRadius: 6 }}>{l}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'start' }}>
        {/* Homme */}
        <div onClick={() => togSplit('homme')} style={{
          background: 'white', borderRadius: 12, padding: 12, cursor: 'pointer',
          border: openSplit === 'homme' ? `.5px solid ${theme.borderActive}` : '.5px solid rgba(26,18,9,.1)',
          transition: 'border-color .2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1209' }}>Raser la tête</div>
              <div style={{ fontSize: 10, color: `${theme.accent}bb`, fontStyle: 'italic', marginTop: 1 }}>Sortie d&apos;ihram</div>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(26,18,9,.3)', transform: openSplit === 'homme' ? 'rotate(180deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>▼</span>
          </div>
          {openSplit === 'homme' && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '.5px solid rgba(26,18,9,.07)' }}>
              <div style={{ fontSize: 11, color: '#7A6D5A', lineHeight: 1.7 }}>
                Rasage complet de la tête — sortie de l&apos;état d&apos;ihram pour les hommes. Votre guide vous accompagne chez un barbier du Haram.
              </div>
              <GuideQuote text={`"Je vous accompagne chez le barbier. C'est un moment simple mais fort — vous sortez de l'ihram, votre Omra est accomplie."`} />
            </div>
          )}
        </div>
        {/* Femme */}
        <div onClick={() => togSplit('femme')} style={{
          background: 'white', borderRadius: 12, padding: 12, cursor: 'pointer',
          border: openSplit === 'femme' ? `.5px solid ${theme.borderActive}` : '.5px solid rgba(26,18,9,.1)',
          transition: 'border-color .2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1209' }}>Couper une mèche</div>
              <div style={{ fontSize: 10, color: `${theme.accent}bb`, fontStyle: 'italic', marginTop: 1 }}>Sortie d&apos;ihram</div>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(26,18,9,.3)', transform: openSplit === 'femme' ? 'rotate(180deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>▼</span>
          </div>
          {openSplit === 'femme' && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '.5px solid rgba(26,18,9,.07)' }}>
              <div style={{ fontSize: 11, color: '#7A6D5A', lineHeight: 1.7 }}>
                Couper une petite longueur de cheveux suffit. Simple, discret, intime. Votre guide vous explique le geste.
              </div>
              <GuideQuote text={`"Je vous explique le geste, et vous vous occupez du reste. C'est votre moment intime — votre Omra est accomplie."`} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConnectorLine({ theme }: { theme: Theme }) {
  return <div style={{ width: 1.5, height: 16, background: `${theme.accent}33`, margin: '0 14px 8px' }} />
}

function StepDesc({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: '#7A6D5A', lineHeight: 1.7 }}>{children}</div>
}

// ── Flow Makkah ────────────────────────────────
function FlowMakkah({ openStep, togStep, openSplit, togSplit, theme }: {
  openStep: string | null; togStep: (id: string) => void
  openSplit: string | null; togSplit: (id: string) => void
  theme: Theme
}) {
  return (
    <>
      <StepCard num={1} highlight icon={<IconPhone color={theme.accent} />}
        title="Votre guide vous contacte"
        emotion="Dès confirmation — il prépare tout"
        open={openStep === 'm1'} onToggle={() => togStep('m1')} theme={theme}
      >
        <StepDesc>
          Dès votre réservation confirmée, votre guide vous contacte.
          Il vous envoie un guide pratique complet : comment mettre l&apos;ihram,
          comment reconnaître le miqat depuis l&apos;avion, et les du&apos;as à lire.
        </StepDesc>
        <GuideQuote text={`"Je vous envoie tout avant votre départ. Quand vous montez à bord, vous savez exactement ce qui vous attend."`} />
        <InfoTag text="Contact sous 24h après réservation" gold />
      </StepCard>

      <StepCard num={2} icon={<IconPlane color={theme.accent} />}
        title="Dans l'avion — miqat + ihram"
        emotion="L'Omra commence au-dessus des nuages"
        open={openStep === 'm2'} onToggle={() => togStep('m2')} theme={theme}
      >
        <StepDesc>
          Le commandant annonce le survol du miqat — c&apos;est à ce moment que vous
          mettez votre ihram et posez votre intention. Votre guide vous a tout préparé.
        </StepDesc>
        <Talbiya theme={theme} />
      </StepCard>

      <StepCard num={3} icon={<IconHandshake color={theme.accent} />}
        title="Arrivée — votre guide vous attend"
        emotion="Sortie bagages, votre prénom sur une pancarte"
        open={openStep === 'm3'} onToggle={() => togStep('m3')} theme={theme}
      >
        <StepDesc>
          Votre guide vous attend à la sortie bagages, prend vos valises
          et vous conduit à l&apos;hôtel. Vous êtes déjà en ihram — l&apos;Omra commence très vite.
        </StepDesc>
        <InfoTag text="Pick-up aéroport — si sélectionné" />
      </StepCard>

      <StepCard num={4} icon={<IconCircle color={theme.accent} />}
        title="Tawaf · Sa'i · Zamzam"
        emotion="7 tours · 7 passages · chaque geste compris"
        open={openStep === 'm4'} onToggle={() => togStep('m4')} theme={theme}
      >
        <StepDesc>
          Votre guide accompagne chaque pas, guide les du&apos;as, raconte l&apos;histoire de chaque lieu.
          Pour les personnes à mobilité réduite, fauteuils gratuits du Haram coordonnés par votre guide.
        </StepDesc>
        <GuideQuote text={`"À chaque tour je vous raconte quelque chose. Vous vivez l'histoire — vous ne la regardez pas."`} />
      </StepCard>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#1A1209', border: `1.5px solid ${theme.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600, color: theme.circleColor,
          }}>5</div>
        </div>
        <SplitRasage openSplit={openSplit} togSplit={togSplit} theme={theme} />
      </div>

      <ConnectorLine theme={theme} />

      <StepCard num={6} icon={<IconKaaba color={theme.accent} />}
        title="Visites à Makkah"
        emotion="Selon les lieux choisis à la réservation"
        open={openStep === 'm6'} onToggle={() => togStep('m6')} theme={theme}
      >
        <StepDesc>
          Jabal Nour, Jabal Thawr, Arafat, Mina... Votre guide anime chaque lieu
          avec son histoire réelle, adaptée à votre groupe.
        </StepDesc>
        <InfoTag text="En fonction de vos visites choisies" />
      </StepCard>

      <StepCard num={7} lineType="end" highlight icon={<IconPlaneLand color={theme.accent} />}
        title="Retour aéroport"
        emotion="Votre guide vous accompagne jusqu'au bout"
        always={
          <div style={{ fontSize: 12, color: '#1A1209', fontFamily: 'var(--font-cormorant, Georgia, serif)', fontStyle: 'italic', lineHeight: 1.6 }}>
            Vous repartez avec quelque chose que personne ne peut vous enlever.
          </div>
        }
        open={openStep === 'm7'} onToggle={() => togStep('m7')} theme={theme}
      >
        <StepDesc>
          Votre guide vous raccompagne à l&apos;aéroport et reste avec vous jusqu&apos;à l&apos;embarquement.
        </StepDesc>
        <InfoTag text="Drop-off aéroport — si sélectionné" />
      </StepCard>
    </>
  )
}

// ── Flow Madinah ───────────────────────────────
function FlowMadinah({ openStep, togStep, openSplit, togSplit, theme }: {
  openStep: string | null; togStep: (id: string) => void
  openSplit: string | null; togSplit: (id: string) => void
  theme: Theme
}) {
  return (
    <>
      <StepCard num={1} highlight icon={<IconPhone color={theme.accent} />}
        title="Votre guide vous contacte"
        emotion="Dès confirmation — il prépare tout"
        open={openStep === 'd1'} onToggle={() => togStep('d1')} theme={theme}
      >
        <StepDesc>
          Votre guide vous contacte dès la confirmation. Il vous explique le processus complet :
          arrivée à Madinah, les visites, le miqat de Dhul Hulaifa, et le voyage vers Makkah.
        </StepDesc>
        <GuideQuote text={`"Je m'occupe de toute la logistique. Vous, vous vous concentrez sur ce qui compte vraiment."`} />
        <InfoTag text="Contact sous 24h après réservation" gold />
      </StepCard>

      <StepCard num={2} icon={<IconHandshake color={theme.accent} />}
        title="Arrivée à Madinah"
        emotion="Pas encore d'ihram — tenue normale"
        open={openStep === 'd2'} onToggle={() => togStep('d2')} theme={theme}
      >
        <StepDesc>
          Vous arrivez à Madinah en tenue normale — la Omra commence à Makkah.
          Votre guide vous attend et vous conduit à l&apos;hôtel.
        </StepDesc>
        <InfoTag text="Pick-up aéroport Madinah — si sélectionné" />
      </StepCard>

      <StepCard num={3} icon={<IconMountain color={theme.accent} />}
        title="Visites à Madinah"
        emotion="Selon les lieux choisis à la réservation"
        open={openStep === 'd3'} onToggle={() => togStep('d3')} theme={theme}
      >
        <StepDesc>
          Masjid An-Nabawi, La Rawdah, Masjid Quba, Badr, Uhud... Votre guide vous accompagne
          sur chaque lieu avec son histoire réelle et émouvante.
        </StepDesc>
        <InfoTag text="En fonction de vos visites choisies" />
      </StepCard>

      <StepCard num={4} lineType="dash" highlight icon={<IconShield color={theme.accent} />}
        title="Miqat — Dhul Hulaifa"
        emotion="L'intention · l'ihram · la Talbiya"
        open={openStep === 'd4'} onToggle={() => togStep('d4')} theme={theme}
      >
        <StepDesc>
          Avant de quitter Madinah pour Makkah, on s&apos;arrête au miqat de Dhul Hulaifa.
          C&apos;est ici que vous mettez votre ihram et posez l&apos;intention de la Omra.
        </StepDesc>
        <Talbiya theme={theme} />
      </StepCard>

      <StepCard num={5} lineType="dash" icon={<IconCar color={theme.accent} />}
        title="Route vers Makkah"
        emotion="En ihram · en Talbiya · en préparation"
        open={openStep === 'd5'} onToggle={() => togStep('d5')} theme={theme}
      >
        <StepDesc>
          Le voyage se fait en ihram, en récitant la Talbiya. Votre guide prépare votre cœur.
          Quand vous apercevez le Haram pour la première fois, vous êtes prêts.
        </StepDesc>
      </StepCard>

      <StepCard num={6} icon={<IconCircle color={theme.accent} />}
        title="Tawaf · Sa'i · Zamzam"
        emotion="7 tours · 7 passages · chaque geste compris"
        open={openStep === 'd6'} onToggle={() => togStep('d6')} theme={theme}
      >
        <StepDesc>
          Votre guide accompagne chaque pas, guide les du&apos;as, raconte l&apos;histoire.
          Pour les personnes à mobilité réduite, fauteuils coordonnés par votre guide.
        </StepDesc>
        <GuideQuote text={`"À chaque tour je vous raconte quelque chose. Vous vivez l'histoire — vous ne la regardez pas."`} />
      </StepCard>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#1A1209', border: `1.5px solid ${theme.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600, color: theme.circleColor,
          }}>7</div>
        </div>
        <SplitRasage openSplit={openSplit} togSplit={togSplit} theme={theme} />
      </div>

      <ConnectorLine theme={theme} />

      <StepCard num={8} icon={<IconKaaba color={theme.accent} />}
        title="Visites à Makkah"
        emotion="Selon les lieux choisis à la réservation"
        open={openStep === 'd8'} onToggle={() => togStep('d8')} theme={theme}
      >
        <StepDesc>
          Jabal Nour, Jabal Thawr, Arafat, Mina... Votre guide anime chaque lieu avec son histoire réelle.
        </StepDesc>
        <InfoTag text="En fonction de vos visites choisies" />
      </StepCard>

      <StepCard num={9} lineType="dash" icon={<IconReturn color={theme.accent} />}
        title="Retour à Madinah"
        emotion="Si votre vol repart de Madinah"
        open={openStep === 'd9'} onToggle={() => togStep('d9')} theme={theme}
      >
        <StepDesc>
          Si votre vol retour part de Madinah, votre guide vous raccompagne.
          Un dernier moment au Masjid An-Nabawi si vous le souhaitez.
        </StepDesc>
        <InfoTag text="Selon votre itinéraire de retour" />
      </StepCard>

      <StepCard num={10} lineType="end" highlight icon={<IconPlaneLand color={theme.accent} />}
        title="Retour aéroport"
        emotion="Jusqu'à l'embarquement"
        always={
          <div style={{ fontSize: 12, color: '#1A1209', fontFamily: 'var(--font-cormorant, Georgia, serif)', fontStyle: 'italic', lineHeight: 1.6 }}>
            Vous repartez avec quelque chose que personne ne peut vous enlever.
          </div>
        }
        open={openStep === 'd10'} onToggle={() => togStep('d10')} theme={theme}
      >
        <StepDesc>
          Votre guide vous accompagne jusqu&apos;à l&apos;embarquement.
          Une Omra accomplie, comprise, et des souvenirs pour toute une vie.
        </StepDesc>
        <InfoTag text="Drop-off aéroport — si sélectionné" />
      </StepCard>
    </>
  )
}
