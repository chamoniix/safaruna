'use client';

import { useState, useEffect } from 'react';

type Guide = {
  id: string;
  name: string;
  email: string;
  city: string;
  langs: string;
  reservations: number;
  joined: string;
  status: string;
  slug: string;
};

const STATUS: Record<string, { color: string; bg: string }> = {
  'ACTIVE':      { color: '#16A34A', bg: '#DCFCE7' },
  'DRAFT':       { color: '#D97706', bg: '#FEF3C7' },
  'REVIEW':      { color: '#D97706', bg: '#FEF3C7' },
  'SUSPENDED':   { color: '#DC2626', bg: '#FEE2E2' },
};

const STATUS_LABELS: Record<string, string> = {
  'ACTIVE':    'ACTIF',
  'DRAFT':     'EN ATTENTE',
  'REVIEW':    'EN ATTENTE',
  'SUSPENDED': 'SUSPENDU',
};

const card: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  border: '1px solid #E8DFC8', overflow: 'hidden',
};

export default function AdminGuides() {
  const [guides, setGuides]   = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('TOUS');
  const [search, setSearch]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState({ email: '', firstName: '', lastName: '' });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/guides');
      if (res.ok) {
        const data = await res.json();
        setGuides(data.guides || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchGuides(); }, []);

  const filters = ['TOUS', 'EN ATTENTE', 'ACTIF', 'SUSPENDU'];

  const visible = guides
    .filter(g => filter === 'TOUS' || STATUS_LABELS[g.status] === filter)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.email || !form.firstName) return;
    setCreating(true);
    setCreateMsg('');
    try {
      const res = await fetch('/api/admin/create-guide-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setCreateMsg('✓ Guide créé — accès envoyé par email');
        setForm({ email: '', firstName: '', lastName: '' });
        fetchGuides();
        setTimeout(() => { setShowModal(false); setCreateMsg(''); }, 2000);
      } else {
        setCreateMsg('Erreur : ' + (data.error || 'inconnue'));
      }
    } catch {
      setCreateMsg('Erreur réseau');
    }
    setCreating(false);
  };

  const handleStatusChange = async (guideId: string, action: 'activate' | 'suspend') => {
    try {
      await fetch('/api/admin/guides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, action }),
      });
      fetchGuides();
    } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="15" height="15" fill="none" stroke="#7A6D5A" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un guide…"
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.2rem', boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid #E8DFC8', borderRadius: 8, fontSize: '0.83rem', color: '#1A1209', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.45rem 0.9rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'inherit', background: filter === f ? '#1A1209' : '#FFFFFF', color: filter === f ? '#F0D897' : '#7A6D5A', border: `1px solid ${filter === f ? '#1A1209' : '#E8DFC8'}` }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#7A6D5A' }}>{visible.length} guide{visible.length > 1 ? 's' : ''}</span>
          <button onClick={() => setShowModal(true)} style={{ padding: '0.55rem 1.1rem', borderRadius: 8, border: 'none', background: '#1A1209', color: '#F0D897', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Créer un guide
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>Chargement...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F3EF', borderBottom: '1px solid #E8DFC8' }}>
                {['Guide', 'Ville', 'Langues', 'Réservations', 'Inscrit le', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.85rem' }}>Aucun guide trouvé</td></tr>
              )}
              {visible.map((g, i) => (
                <tr key={g.id} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8', borderBottom: '1px solid #F0EBE0' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: '#1A1209', fontSize: '0.85rem' }}>{g.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>{g.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.83rem', color: '#4A3F30' }}>{g.city || '—'}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#7A6D5A' }}>{g.langs || '—'}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209' }}>{g.reservations}</td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: '#7A6D5A' }}>{g.joined}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.3rem 0.65rem', borderRadius: 20, background: STATUS[g.status]?.bg || '#F5F5F5', color: STATUS[g.status]?.color || '#7A6D5A' }}>
                      {STATUS_LABELS[g.status] || g.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {(g.status === 'DRAFT' || g.status === 'REVIEW') && (
                        <button onClick={() => handleStatusChange(g.id, 'activate')} style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #16A34A', background: '#DCFCE7', color: '#16A34A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Valider</button>
                      )}
                      {g.status === 'ACTIVE' && (
                        <button onClick={() => handleStatusChange(g.id, 'suspend')} style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #DC2626', background: '#FEE2E2', color: '#DC2626', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Suspendre</button>
                      )}
                      {g.status === 'SUSPENDED' && (
                        <button onClick={() => handleStatusChange(g.id, 'activate')} style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #16A34A', background: '#DCFCE7', color: '#16A34A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Réactiver</button>
                      )}
                      <button style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid #E8DFC8', background: '#FFFFFF', color: '#7A6D5A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Voir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal créer guide */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>Créer un accès guide</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6D5A', display: 'block', marginBottom: '0.3rem' }}>Prénom *</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Naïm" style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #EDE8DC', borderRadius: 10, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6D5A', display: 'block', marginBottom: '0.3rem' }}>Nom</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="LAAMARI" style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #EDE8DC', borderRadius: 10, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6D5A', display: 'block', marginBottom: '0.3rem' }}>Email *</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="guide@email.com" type="email" style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #EDE8DC', borderRadius: 10, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {createMsg && <div style={{ fontSize: '0.82rem', color: createMsg.startsWith('✓') ? '#16A34A' : '#DC2626', fontWeight: 600, textAlign: 'center' }}>{createMsg}</div>}
              <button onClick={handleCreate} disabled={creating || !form.email || !form.firstName} style={{ padding: '0.8rem', background: '#1A1209', color: '#F0D897', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.875rem', cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: creating ? 0.7 : 1, marginTop: '0.5rem' }}>
                {creating ? 'Création...' : 'Créer et envoyer les accès →'}
              </button>
              <p style={{ fontSize: '0.72rem', color: '#7A6D5A', textAlign: 'center', margin: 0 }}>Un email avec le mot de passe temporaire sera envoyé automatiquement.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
