import React from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import { IconMosque, IconGraduationCap, IconHandshake, IconGlobe, IconSparkles, IconMoon } from '@/components/Icons';

const TEAM = [
  {
    name: 'Yacine Benali',
    role: 'Co-fondateur & CEO',
    origin: 'Algérien, 34 ans',
    bio: "Ancien cadre bancaire reconverti après une Omra qui a changé sa vie. Yacine a fondé SAFARUMA pour que chaque pèlerin vive ce qu'il a vécu — une connexion profonde, guidée par un expert.",
    initials: 'YB',
    color: '#1A1209',
  },
  {
    name: 'Amira Oussama',
    role: 'Co-fondatrice & Directrice des Guides',
    origin: 'Marocaine, 31 ans',
    bio: "Spécialiste en sciences islamiques diplômée de l'Université de Médine, Amira pilote la certification et la formation de tous les guides SAFARUMA. Chaque guide passe par elle.",
    initials: 'AO',
    color: '#2A1F0E',
  },
  {
    name: 'Tariq Moussaoui',
    role: 'Directeur Technique',
    origin: 'Français, 29 ans',
    bio: "Ingénieur passionné par l'impact social du digital. Tariq a construit la plateforme SAFARUMA pour qu'elle soit aussi simple qu'une réservation d'hôtel, aussi sûre qu'une banque.",
    initials: 'TM',
    color: '#C9A84C',
  },
];

const TIMELINE = [
  { year: '2021', title: 'La frustration fondatrice', desc: "Yacine part en Omra avec un groupe de 50 personnes. Guide arabophone uniquement, programme trop chargé, aucun temps pour la spiritualité. Il rentre avec une idée." },
  { year: '2022', title: 'La recherche', desc: "8 mois à interviewer 200 pèlerins francophones. Le même problème partout : l'accompagnement de qualité n'existait pas dans leur langue." },
  { year: '2023', title: 'Les premiers guides', desc: "Amira rejoint l'aventure et certifie les 12 premiers guides SAFARUMA. 300 pèlerins accompagnés la première année. 98% de satisfaction." },
  { year: '2024', title: 'La plateforme', desc: "Tariq construit SAFARUMA.com. Les pèlerins peuvent enfin choisir, comparer, réserver leur guide privé en quelques clics." },
  { year: '2025', title: "L'expansion", desc: "320 guides certifiés. 15 000 pèlerins accompagnés. SAFARUMA devient la référence francophone pour la Omra privée." },
  { year: '2026', title: 'La vision', desc: "Être présent pour chaque pèlerin francophone dans le monde entier. Du Maroc à la Martinique, de Lyon à Montréal." },
];

const VALEURS: Array<{ icon: React.ReactNode; title: string; desc: string }> = [
  { icon: <IconMosque size={28} stroke="#C9A84C" />, title: "Foi d'abord", desc: "Chaque décision que nous prenons est filtrée par une question simple : est-ce que cela sert le pèlerin dans son voyage spirituel ?" },
  { icon: <IconGraduationCap size={28} stroke="#C9A84C" />, title: 'Excellence certifiée', desc: "Nos guides sont diplômés en sciences islamiques, formés à l'accueil et certifiés après un examen rigoureux par notre équipe." },
  { icon: <IconHandshake size={28} stroke="#C9A84C" />, title: 'Confiance totale', desc: "Paiement sécurisé, annulation gratuite 48h, assistance 24h/24. Nous ne disparaissons pas une fois la réservation faite." },
  { icon: <IconGlobe size={28} stroke="#C9A84C" />, title: 'Accessibilité', desc: "L'Omra de qualité ne devrait pas être réservée à ceux qui parlent arabe. Nous guidons dans 12 langues." },
  { icon: <IconSparkles size={28} stroke="#C9A84C" />, title: 'Présence', desc: "Pas de groupe de 40 personnes. Un guide, votre famille. Une Omra sur-mesure, à votre rythme, selon vos besoins." },
  { icon: <IconMoon size={28} stroke="#C9A84C" />, title: 'Continuité spirituelle', desc: "Notre accompagnement ne s'arrête pas à l'aéroport. Ressources, du'as, récits — nous restons présents avant, pendant et après." },
];

const COMPARISON = [
  {
    critere: 'Langue d\'accompagnement',
    safaruma: 'Français + 11 langues',
    holygo: 'Arabe principalement',
    agence: 'Guide de groupe polyvalent',
  },
  {
    critere: 'Type d\'accompagnement',
    safaruma: 'Guide privé dédié',
    holygo: 'Groupe 20-50 personnes',
    agence: 'Groupe 30-80 personnes',
  },
  {
    critere: 'Certification des guides',
    safaruma: 'Sciences islamiques + examen SAFARUMA',
    holygo: 'Non certifié indépendamment',
    agence: 'Variable selon agence',
  },
  {
    critere: 'Personnalisation',
    safaruma: 'Programme 100% sur-mesure',
    holygo: 'Programme fixe',
    agence: 'Programme fixe de groupe',
  },
  {
    critere: 'Réservation en ligne',
    safaruma: 'Plateforme dédiée, 2 min',
    holygo: 'Application mobile',
    agence: 'Téléphone / agence physique',
  },
  {
    critere: 'Annulation flexible',
    safaruma: 'Gratuite jusqu\'à 48h',
    holygo: 'Conditions restrictives',
    agence: 'Souvent non remboursable',
  },
  {
    critere: 'Tarif indicatif / jour',
    safaruma: 'Dès 120€/jour',
    holygo: 'Forfait tout-compris',
    agence: 'Inclus dans le forfait',
  },
];

export default function AProposPage() {
  return (
    <>
      <ScrollReveal />

      {/* HERO */}
      <section style={{
        background: '#0D0A06',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '8rem 2rem 6rem',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(8rem, 20vw, 18rem)',
          fontFamily: 'serif',
          color: 'rgba(201,168,76,0.04)',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 1,
        }}>سفرنا</div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '1.5rem',
          }}>Notre histoire</div>

          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 600,
            color: 'var(--cream)',
            lineHeight: 1.15,
            marginBottom: '2rem',
          }}>
            Née d&apos;une frustration,<br />
            <span style={{ color: 'var(--gold)' }}>construite avec foi.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(250,247,240,0.7)',
            lineHeight: 1.8,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            SAFARUMA est née d&apos;une Omra manquée. Pas manquée dans le sens du voyage —
            le vol a décollé, les tawaf ont été faits, les prières récitées.
            Manquée dans le sens de la connexion. De la profondeur. De la présence.
          </p>
        </div>
      </section>

      {/* ORIGINE — HISTOIRE */}
      <section style={{ background: 'var(--cream)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="reveal" style={{
            background: 'var(--deep)',
            borderRadius: '24px',
            padding: '3rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '8rem',
              fontFamily: 'serif',
              color: 'rgba(201,168,76,0.06)',
              lineHeight: 1,
            }}>❝</div>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.5rem',
            }}>Décembre 2021 — Médine</div>
            <p style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
              color: 'var(--cream)',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}>
              &ldquo;J&apos;étais à 50 mètres de la tombe du Prophète ﷺ.
              Je ne comprenais rien de ce que le guide disait.
              Autour de moi, 40 personnes se bousculaient.
              Je cherchais la paix — j&apos;ai trouvé le chaos.
              Dans l&apos;avion du retour, j&apos;ai ouvert mon ordinateur.&rdquo;
            </p>
            <div style={{
              marginTop: '2rem',
              color: 'rgba(250,247,240,0.5)',
              fontSize: '0.85rem',
            }}>— Yacine Benali, co-fondateur de SAFARUMA</div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{ background: 'var(--sand)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1rem',
            }}>Notre parcours</div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 600,
              color: 'var(--deep)',
            }}>De la frustration à la référence</h2>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'rgba(201,168,76,0.25)',
              transform: 'translateX(-50%)',
            }} />

            {TIMELINE.map((item, i) => (
              <div key={item.year} className="reveal" style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '3rem',
                flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }}>
                  {i % 2 === 0 && (
                    <>
                      <div style={{
                        fontSize: '0.65rem',
                        letterSpacing: '0.15em',
                        color: 'var(--gold)',
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem',
                      }}>{item.year}</div>
                      <h3 style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: 'var(--deep)',
                        marginBottom: '0.5rem',
                      }}>{item.title}</h3>
                      <p style={{ color: 'rgba(26,18,9,0.7)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        {item.desc}
                      </p>
                    </>
                  )}
                </div>

                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  flexShrink: 0,
                  marginTop: '6px',
                  position: 'relative',
                  zIndex: 1,
                }} />

                <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'left' : 'right' }}>
                  {i % 2 !== 0 && (
                    <>
                      <div style={{
                        fontSize: '0.65rem',
                        letterSpacing: '0.15em',
                        color: 'var(--gold)',
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem',
                      }}>{item.year}</div>
                      <h3 style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: 'var(--deep)',
                        marginBottom: '0.5rem',
                      }}>{item.title}</h3>
                      <p style={{ color: 'rgba(26,18,9,0.7)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        {item.desc}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section style={{ background: 'var(--cream)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1rem',
            }}>Ce en quoi nous croyons</div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 600,
              color: 'var(--deep)',
            }}>Nos valeurs fondatrices</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {VALEURS.map((v) => (
              <div key={v.title} className="reveal" style={{
                background: 'var(--sand)',
                borderRadius: '16px',
                padding: '2rem',
                borderTop: '3px solid var(--gold)',
              }}>
                <div style={{ marginBottom: '1rem' }}>{v.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--deep)',
                  marginBottom: '0.75rem',
                }}>{v.title}</h3>
                <p style={{ color: 'rgba(26,18,9,0.7)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ background: '#0D0A06', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1rem',
            }}>L&apos;équipe fondatrice</div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 600,
              color: 'var(--cream)',
            }}>Ceux qui ont rendu SAFARUMA possible</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
          }}>
            {TEAM.map((member) => (
              <div key={member.name} className="reveal" style={{
                background: 'rgba(250,247,240,0.04)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: '20px',
                padding: '2.5rem',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: member.color,
                  border: '2px solid var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.8rem',
                  fontWeight: 600,
                  color: 'var(--gold)',
                }}>{member.initials}</div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--cream)',
                  marginBottom: '0.25rem',
                }}>{member.name}</h3>
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginBottom: '0.5rem',
                }}>{member.role}</div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(250,247,240,0.4)',
                  marginBottom: '1.5rem',
                }}>{member.origin}</div>
                <p style={{
                  color: 'rgba(250,247,240,0.65)',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ background: 'var(--cream)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1rem',
            }}>Pourquoi SAFARUMA ?</div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 600,
              color: 'var(--deep)',
              marginBottom: '1rem',
            }}>Ce qui nous différencie</h2>
            <p style={{ color: 'rgba(26,18,9,0.6)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              Comparez objectivement. Nous n&apos;avons rien à cacher.
            </p>
          </div>

          <div className="reveal" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(26,18,9,0.5)',
                    borderBottom: '2px solid var(--sand)',
                  }}>Critère</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    background: 'rgba(201,168,76,0.06)',
                    borderBottom: '2px solid var(--gold)',
                  }}>✦ SAFARUMA</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(26,18,9,0.5)',
                    borderBottom: '2px solid var(--sand)',
                  }}>HolyGO</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(26,18,9,0.5)',
                    borderBottom: '2px solid var(--sand)',
                  }}>Agence traditionnelle</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.critere} style={{
                    background: i % 2 === 0 ? 'transparent' : 'rgba(232,223,200,0.3)',
                  }}>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'var(--deep)',
                      borderBottom: '1px solid rgba(232,223,200,0.5)',
                    }}>{row.critere}</td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: 'var(--deep)',
                      background: 'rgba(201,168,76,0.06)',
                      borderBottom: '1px solid rgba(201,168,76,0.15)',
                      fontWeight: 500,
                    }}>
                      <span style={{ marginRight: '0.4rem', color: '#2D7A3B' }}>✓</span>
                      {row.safaruma}
                    </td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: 'rgba(26,18,9,0.55)',
                      borderBottom: '1px solid rgba(232,223,200,0.5)',
                    }}>{row.holygo}</td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: 'rgba(26,18,9,0.55)',
                      borderBottom: '1px solid rgba(232,223,200,0.5)',
                    }}>{row.agence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MANIFESTO QUOTE */}
      <section style={{
        background: 'var(--deep)',
        padding: '6rem 2rem',
        textAlign: 'center',
      }}>
        <div className="reveal" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            fontSize: '3rem',
            color: 'rgba(201,168,76,0.3)',
            lineHeight: 1,
            marginBottom: '1.5rem',
            fontFamily: 'serif',
          }}>❝</div>
          <blockquote style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontStyle: 'italic',
            color: 'var(--cream)',
            lineHeight: 1.6,
            margin: 0,
          }}>
            L&apos;Omra n&apos;est pas un voyage touristique.
            C&apos;est un rendez-vous avec Allah.
            Nous voulons que vous y soyez pleinement présent.
          </blockquote>
          <div style={{
            marginTop: '2rem',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}>— La philosophie SAFARUMA</div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--cream)', padding: '6rem 2rem', textAlign: 'center' }}>
        <div className="reveal">
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 600,
            color: 'var(--deep)',
            marginBottom: '1rem',
          }}>Prêt à vivre votre Omra autrement ?</h2>
          <p style={{
            color: 'rgba(26,18,9,0.6)',
            marginBottom: '2.5rem',
            fontSize: '1.05rem',
          }}>
            320 guides certifiés. 12 langues. Une plateforme pensée pour vous.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/guides" style={{
              display: 'inline-block',
              background: 'var(--gold)',
              color: 'var(--deep)',
              padding: '1rem 2.5rem',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}>Trouver mon guide</a>
            <a href="/contact" style={{
              display: 'inline-block',
              background: 'transparent',
              color: 'var(--deep)',
              padding: '1rem 2.5rem',
              borderRadius: '50px',
              fontWeight: 500,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid var(--sand)',
            }}>Nous contacter</a>
          </div>
        </div>
      </section>
    </>
  );
}
