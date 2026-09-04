import { BookOpenCheck, CreditCard, IdCard } from 'lucide-react'

const documents = [
  { title: 'RIB', icon: CreditCard },
  { title: 'Passeport', icon: BookOpenCheck },
  { title: 'Permis de conduire', icon: IdCard },
]

export default function Page() {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <header>
        <div style={{ color: '#9A6C14', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Documents Guide</div>
        <h1 style={{ margin: '6px 0', color: '#1A1209', fontFamily: 'var(--font-cormorant, serif)', fontSize: 30 }}>Mes documents</h1>
        <p style={{ margin: 0, color: '#756B5D', fontSize: 14, lineHeight: 1.6 }}>Cette section sera disponible prochainement.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {documents.map(document => {
          const Icon = document.icon
          return (
            <article key={document.title} data-disabled="true" style={{ background: '#F4F1EB', border: '1px solid #DDD6C7', borderRadius: 14, padding: 18, display: 'grid', gap: 12, opacity: 0.72 }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, background: '#E9E4DB', color: '#82796D', display: 'grid', placeItems: 'center' }}>
                <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <h2 style={{ margin: 0, color: '#4E473F', fontFamily: 'var(--font-cormorant, serif)', fontSize: 20 }}>{document.title}</h2>
                <p style={{ margin: '5px 0 0', color: '#8A8176', fontSize: 13, lineHeight: 1.55 }}>Bientôt disponible</p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
