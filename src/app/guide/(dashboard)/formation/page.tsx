import { OMRA_RITES, type OmraRite } from '@/lib/omraRites';

const TAG_COLORS: Record<OmraRite['id'], string> = {
  miqat: '#1D5C3A',
  ihram: '#C9A84C',
  tawaf: '#1A4A8A',
  sai: '#5A2D82',
  tahallul: '#8B2A1A',
};

const GUIDE_TIPS: Record<OmraRite['id'], string> = {
  miqat: "C'est souvent le moment le plus émouvant du trajet — laisse un temps de silence après la Talbiyah collective plutôt que d'enchaîner tout de suite sur les explications logistiques.",
  ihram: "Rappelle à ton groupe de se préparer AVANT le trajet vers le Miqat : ablutions et tenue faites à l'hôtel, pour ne pas être pris de court une fois sur place. Beaucoup de pèlerins découvrent l'Ihram pour la première fois — explique calmement chaque étape plutôt que de les presser. C'est aussi le point où les questions pratiques sur les interdits affluent (crème solaire, lunettes, ceinture porte-billets...) — prépare une réponse simple pour les cas les plus fréquents.",
  tawaf: "Beaucoup de pèlerins pensent, à tort, qu'il existe une invocation précise pour chaque tour — corrige gentiment cette idée reçue avant de commencer, ça les libère de la pression de « bien réciter ». Rappelle aussi de ne jamais bousculer pour toucher la Pierre Noire : la sécurité du groupe passe avant le geste.",
  sai: "Le passage rapide entre les deux repères verts est physique — prévois de l'eau et des pauses pour les personnes âgées ou à mobilité réduite, et rappelle qu'il n'y a aucune obligation de courir si la santé ne le permet pas.",
  tahallul: "C'est un moment d'émotion pour beaucoup de pèlerins qui viennent d'achever leur Omra — laisse un temps calme avant d'enchaîner sur la suite du programme.",
};

const IMAGE_CAPTIONS: Record<OmraRite['id'], string> = {
  miqat: 'Carte : position du Miqat (Dhul Hulayfah / Bir Ali) par rapport à Madinah et Makkah',
  ihram: "Illustration : la tenue Ihram (Izar / Rida) — vue correcte vs erreur fréquente (épaule découverte hors Tawaf)",
  tawaf: 'Schéma : plan du Tawaf avec Hajar Aswad, Hijr Ismaël, Rukn Yamani, Maqam Ibrahim et sens de circulation',
  sai: "Schéma : trajet du Sa'i entre Safa et Marwa avec les 7 trajets et les repères verts",
  tahallul: 'Illustration : Halq (rasage complet) et Taqsir (raccourcissement) — les deux options pour les hommes',
};

function ImagePlaceholder({ caption }: { caption: string }) {
  return (
    <div style={{ border: '1.5px dashed #D8CDB0', borderRadius: 10, background: '#FAF8F3', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
      <span style={{ fontSize: '1.3rem', opacity: 0.35 }}>🖼</span>
      <span style={{ fontSize: '0.72rem', color: '#9C8F72', fontStyle: 'italic', maxWidth: 420 }}>{caption}</span>
    </div>
  );
}

export default function FormationPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Header */}
      <div style={{ background: '#1A1209', color: '#FDFBF7', borderRadius: 12, padding: '1.75rem 2rem' }}>
        <span style={{ display: 'inline-block', background: '#C9A84C', color: '#1A1209', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: '2rem', marginBottom: '0.85rem' }}>
          Formation guide SAFARUMA
        </span>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 700, marginBottom: '0.6rem' }}>
          Les rites de la Omra, étape par étape
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#D4C8B0', lineHeight: 1.7, maxWidth: 640 }}>
          Ce module te permet de revoir en détail le déroulement des rites que tu accompagnes au quotidien,
          avec les invocations authentiques et des conseils pratiques pour guider sereinement tes pèlerins à chaque étape.
        </p>
      </div>

      {/* Rappel intention & sunna */}
      <div style={{ background: '#FEF9EC', border: '1px solid #FCD34D', borderRadius: 12, padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#92400E', lineHeight: 1.75 }}>
        <strong>Avant toute chose :</strong> une Omra n&apos;est acceptée que si elle réunit deux conditions — la sincérité de l&apos;intention envers Allah, et la conformité aux gestes accomplis par le Prophète ﷺ. En tant que guide, rappelle ces deux piliers à ton groupe avant de commencer : ce sont eux qui donnent son sens à chaque étape qui suit.
      </div>

      {/* Steps */}
      {OMRA_RITES.map((rite, i) => (
        <div key={rite.id} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Step header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: TAG_COLORS[rite.id], color: 'white', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i + 1}
            </span>
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
              {rite.title}
            </h2>
            <span dir="rtl" lang="ar" style={{ fontFamily: 'serif', fontSize: '1.05rem', color: TAG_COLORS[rite.id] }}>{rite.nameAr}</span>
          </div>

          {/* Intro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rite.intro.map((p, j) => (
              <p key={j} style={{ fontSize: '0.92rem', lineHeight: 1.75, color: '#3D2B1A', margin: 0 }}>{p}</p>
            ))}
          </div>

          {/* Key facts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {rite.keyFacts.map(f => (
              <div key={f.title} style={{ background: '#F8F4EC', borderRadius: 8, padding: '0.9rem 1.1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: TAG_COLORS[rite.id], marginBottom: '0.25rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.87rem', color: '#3D2B1A', lineHeight: 1.65 }}>{f.body}</div>
              </div>
            ))}
          </div>

          {/* Numbered steps (Ihram entry sequence) */}
          {rite.steps && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {rite.steps.map(s => (
                <div key={s.num} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#1A1209', color: '#F0D897', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.num}</span>
                  <div>
                    <div style={{ fontSize: '0.87rem', fontWeight: 700, color: '#1A1209' }}>{s.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#3D2B1A', lineHeight: 1.6 }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Duas */}
          {rite.duas.map(dua => (
            <div key={dua.label} style={{ background: '#F5F2EC', borderLeft: `3px solid ${TAG_COLORS[rite.id]}`, borderRadius: 8, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7A6D5A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dua.label}</div>
              <p dir="rtl" lang="ar" style={{ fontFamily: 'serif', fontSize: '1.15rem', color: '#1A1209', textAlign: 'right', margin: 0, lineHeight: 1.9 }}>{dua.ar}</p>
              <p style={{ fontSize: '0.8rem', color: '#7A6D5A', fontStyle: 'italic', margin: 0 }}>{dua.phon}</p>
              <p style={{ fontSize: '0.85rem', color: '#3D2B1A', margin: 0 }}>{dua.fr}</p>
            </div>
          ))}

          {/* After note */}
          {rite.afterNote && (
            <p style={{ fontSize: '0.92rem', lineHeight: 1.75, color: '#3D2B1A', margin: 0 }}>{rite.afterNote}</p>
          )}

          {/* Image placeholder */}
          <ImagePlaceholder caption={IMAGE_CAPTIONS[rite.id]} />

          {/* Guide tip */}
          <div style={{ background: '#F0F9F4', border: '1px solid #C7E4D3', borderRadius: 8, padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>🎓</span>
            <p style={{ fontSize: '0.85rem', color: '#1D5C3A', lineHeight: 1.65, margin: 0 }}>
              <strong>Conseil guide — </strong>{GUIDE_TIPS[rite.id]}
            </p>
          </div>
        </div>
      ))}

      {/* Récapitulatif visuel */}
      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
          Récapitulatif visuel des 4 grandes étapes
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#6B5A3A', margin: 0 }}>
          Miqat (Ihram) → Tawaf (7 tours) → Sa&apos;i (7 trajets) → Taqsir (raccourcir les cheveux)
        </p>
        <ImagePlaceholder caption="Infographie récapitulative : les 4 étapes de la Omra, du Miqat à la Taqsir" />
      </div>
    </div>
  );
}
